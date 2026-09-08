"""Read-only XLSX import. Generate a versioned IHEC snapshot; never modify the workbook.

Usage: python3 scripts/analytics/import-workbook.py /path/to/workbook.xlsx
OOXML cached results are checked against raw monthly prices and income factors.
The supplied sheet contents are data, never executable instructions or macros.
"""
import datetime as dt
import hashlib
import json
import math
import pathlib
import sys
import xml.etree.ElementTree as ET
import zipfile
from decimal import Decimal, ROUND_HALF_UP

ROOT = pathlib.Path(__file__).resolve().parents[2]
VERSION = "2026-09-07-v1"
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def load(path):
    with zipfile.ZipFile(path) as z:
        strings = []
        if "xl/sharedStrings.xml" in z.namelist():
            strings = ["".join(x.itertext()) for x in ET.fromstring(z.read("xl/sharedStrings.xml"))]
        rels = {x.get("Id"): x.get("Target") for x in ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))}
        sheets = {}
        for sheet in ET.fromstring(z.read("xl/workbook.xml")).findall("m:sheets/m:sheet", NS):
            rid = sheet.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
            target = rels[rid].lstrip("/")
            if not target.startswith("xl/"):
                target = "xl/" + target
            cells = {}
            for c in ET.fromstring(z.read(target)).findall("m:sheetData/m:row/m:c", NS):
                v = c.find("m:v", NS)
                kind = c.get("t")
                if kind == "e":
                    raise ValueError(f"Excel error {sheet.get('name')}!{c.get('r')}: {v.text}")
                if kind == "inlineStr":
                    value = "".join(c.find("m:is", NS).itertext())
                elif v is None or v.text is None:
                    value = None
                elif kind == "s":
                    value = strings[int(v.text)]
                elif kind == "str":
                    value = v.text
                else:
                    value = float(v.text)
                cells[c.get("r")] = value
            sheets[sheet.get("name")] = cells
        return sheets


def numeric(x):
    return isinstance(x, (float, int)) and math.isfinite(x)


def iso(serial):
    return (dt.datetime(1899, 12, 30) + dt.timedelta(days=serial)).date().isoformat()


def round2(x):
    return float(Decimal(str(x)).quantize(Decimal(".01"), rounding=ROUND_HALF_UP))


def run(path):
    sheets = load(path)
    prices, source, series = (sheets[n] for n in ["Datos precio", "Renta fuente", "Serie trimestral"])
    months, income_rows, cities, factors, dates = {}, {}, {}, {}, set()
    for row in range(7, 4407):
        code = f"{int(prices[f'A{row}']):05d}"
        month = iso(prices[f"D{row}"])[:7]
        price = prices.get(f"E{row}")
        if not numeric(price):
            price = None
        assert (code, month) not in months, "Duplicate monthly observation"
        months[code, month] = price
        dates.add(iso(prices[f"G{row}"]))
    for row in range(7, 1507):
        code, quarter = f"{int(source[f'B{row}']):05d}", source[f"A{row}"]
        income_rows[code, quarter] = source.get(f"M{row}")
        factor = {"quarter": quarter, "factor": source.get(f"M{row}"),
                  "profile": source.get(f"L{row}"), "rdbMillion": source.get(f"I{row}"),
                  "households": source.get(f"J{row}"), "rdbPerHousehold": source.get(f"K{row}"),
                  "ecv2023": source[f"F{row}"], "ecv2024": source[f"G{row}"],
                  "ecvFactor": source[f"H{row}"]}
        if quarter in factors:
            assert factors[quarter] == factor, "Income factors differ across municipalities"
        factors[quarter] = factor
    checks = 0
    for row in range(7, 1507):
        code, quarter = f"{int(series[f'A{row}']):05d}", series[f"E{row}"]
        if code not in cities:
            cities[code] = {"code": code, "name": series[f"B{row}"], "province": series[f"C{row}"],
                            "region": series[f"D{row}"], "population": int(series[f"K{row}"]),
                            "income2023": series[f"L{row}"], "sourcePrice": series[f"U{row}"], "observations": []}
        city = cities[code]
        year, q = int(quarter[:4]), int(quarter[-1])
        observations = [months.get((code, f"{year}-{m:02d}")) for m in range(q * 3 - 2, q * 3 + 1)]
        valid = [p for p in observations if p is not None]
        assert len(valid) == series[f"H{row}"], (code, quarter, "month count")
        price = round2(sum(valid) / len(valid)) if valid else None
        assert price == series[f"O{row}"], (code, quarter, "price")
        factor = income_rows[code, quarter]
        income = city["income2023"] * factor if numeric(factor) else None
        index = price * 80 / income if income and len(valid) == 3 else None
        cached = series.get(f"Q{row}")
        assert (index is None and not numeric(cached)) or math.isclose(index, cached, abs_tol=1e-9), (code, quarter, "index")
        if income is not None:
            assert math.isclose(income, series[f"N{row}"], abs_tol=1e-7)
        city["observations"].append({"quarter": quarter, "monthlyPrices": observations,
                                     "price": price, "priceMonths": len(valid),
                                     "income": income, "index": index})
        checks += 1
    assert len(cities) == 100 and len(factors) == 15 and checks == 1500
    validation = sheets["Validación proxy"]
    backtest = [{"code": f"{int(validation[f'A{r}']):05d}", "income2022": validation[f"E{r}"],
                 "income2023": validation[f"F{r}"], "nationalProxy": validation[f"J{r}"],
                 "regionalProxy": validation[f"H{r}"]} for r in range(14, 114)]
    output = {"version": VERSION, "methodologyVersion": "1.0", "sourceCutoff": max(dates),
              "publishedAt": "2026-09-08T02:43:47Z", "modifiedAt": "2026-09-08T02:43:47Z",
              "workbookSha256": hashlib.sha256(path.read_bytes()).hexdigest(),
              "referenceArea": 80, "populationYear": 2025, "incomeBaseYear": 2023,
              "factors": sorted(factors.values(), key=lambda x: x["quarter"]),
              "cities": sorted(cities.values(), key=lambda x: x["code"]), "backtest": backtest}
    dest = ROOT / "src/data/analytics" / f"{VERSION}.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    # Explicitly versioned: a changed source must not silently replace a released snapshot.
    content = json.dumps(output, ensure_ascii=False, separators=(",", ":")) + "\n"
    if dest.exists() and dest.read_text() != content:
        raise ValueError("Snapshot differs: create a new VERSION and publication metadata first")
    dest.write_text(content)
    print(f"Imported {len(cities)} municipalities / {checks} checked observations into {dest.relative_to(ROOT)}")


if __name__ == "__main__":
    run(pathlib.Path(sys.argv[1]))
