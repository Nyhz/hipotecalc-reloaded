# -*- coding: utf-8 -*-
"""ITP illustration derived from src/fiscal; legal assumptions are in case.ts."""
import json
import subprocess
from pathlib import Path

_CASE = json.loads(subprocess.check_output(["node", str(Path(__file__).with_name("export-data.mjs"))], text=True))

BASE = _CASE["base"]

# key: Natural Earth 'region' value (or province name for País Vasco / ciudades)
# value: (display name ES, display name EN, effective %, footnote marker)
ITP = {
    "Cataluña":            ("Cataluña",            "Catalonia",           _CASE["rows"]["cataluna"]["rate"], ""),
    "Valenciana":          ("C. Valenciana",       "Valencia",             _CASE["rows"]["comunidad-valenciana"]["rate"], ""),
    "Aragón":              ("Aragón",              "Aragón",               _CASE["rows"]["aragon"]["rate"], ""),
    "Asturias":            ("Asturias",            "Asturias",             _CASE["rows"]["asturias"]["rate"], ""),
    "Castilla y León":     ("Castilla y León",     "Castilla y León",      _CASE["rows"]["castilla-y-leon"]["rate"], ""),
    "Murcia":              ("Murcia",              "Murcia",               _CASE["rows"]["murcia"]["rate"], ""),
    "Andalucía":           ("Andalucía",           "Andalusia",            _CASE["rows"]["andalucia"]["rate"], ""),
    "Cantabria":           ("Cantabria",           "Cantabria",            _CASE["rows"]["cantabria"]["rate"], ""),
    "Extremadura":         ("Extremadura",         "Extremadura",          _CASE["rows"]["extremadura"]["rate"], "²"),
    "Galicia":             ("Galicia",             "Galicia",              _CASE["rows"]["galicia"]["rate"], "³"),
    "La Rioja":            ("La Rioja",            "La Rioja",             _CASE["rows"]["la-rioja"]["rate"], ""),
    "Castilla-La Mancha":  ("Castilla-La Mancha",  "Castilla-La Mancha",   _CASE["rows"]["castilla-la-mancha"]["rate"], "¹"),
    "Foral de Navarra":    ("Navarra",             "Navarre",              _CASE["rows"]["navarra"]["rate"], ""),
    "Madrid":              ("Madrid",              "Madrid",               _CASE["rows"]["madrid"]["rate"], "⁴"),
    "Canary Is.":          ("Canarias",            "Canary Islands",       _CASE["rows"]["canarias"]["rate"], ""),
    "Islas Baleares":      ("Baleares",            "Balearic Islands",     _CASE["rows"]["baleares"]["rate"], ""),
    # País Vasco — three foral territories, same rate for vivienda
    "Álava":               ("Álava",               "Álava",                _CASE["rows"]["alava"]["rate"], "⁵"),
    "Bizkaia":             ("Bizkaia",             "Bizkaia",              _CASE["rows"]["bizkaia"]["rate"], "⁵"),
    "Gipuzkoa":            ("Gipuzkoa",            "Gipuzkoa",             _CASE["rows"]["gipuzkoa"]["rate"], "⁵"),
    "Ceuta":               ("Ceuta",               "Ceuta",                _CASE["rows"]["ceuta"]["rate"], ""),
    "Melilla":             ("Melilla",             "Melilla",              _CASE["rows"]["melilla"]["rate"], ""),
}

# Provinces that must NOT be dissolved into their region (kept individually)
KEEP_PROVINCE = {"Álava", "Bizkaia", "Gipuzkoa", "Ceuta", "Melilla"}

FOOTNOTES_ES = [
    "¹ CLM: primera vivienda, hipoteca >50 %, declarado/referencia/tasación compatibles; en otro caso, 9 %.",
    "² Extremadura: el 7 % exige base imponible de IRPF ≤ 30.000 € (individual) o 55.000 € (conjunta); en otro caso, 8 %.",
    "³ Galicia: ejemplo de unidad familiar de 1 persona, precio y patrimonio ≤240.000 €; en otro caso, 8 %.",
    "⁴ Madrid: tipo general del 6 % con la bonificación del 10 % de la cuota por vivienda habitual ≤ 250.000 €.",
    "⁵ País Vasco: ejemplo de 140 m² construidos/115 útiles; el 2,5 % exige superficie/titularidad y norma foral.",
]

FOOTNOTES_EN = [
    "¹ CLM: first main home, mortgage >50%, declared/reference/appraisal conditions met; otherwise 9%.",
    "² Extremadura: the 7 % rate requires income tax base ≤ €30,000 (individual) or €55,000 (joint); otherwise 8 %.",
    "³ Galicia: one-person household example, price and assets ≤€240,000; otherwise 8%.",
    "⁴ Madrid: 6 % general rate with the 10 % tax-credit for a main home valued ≤ €250,000.",
    "⁵ Basque Country: example with 140m² built/115m² usable; 2.5% needs foral area/ownership conditions.",
]

TXT = {
    "es": {
        "title": "Cuánto ITP se paga al comprar vivienda usada, por comunidad",
        "sub": ("Impuesto de Transmisiones Patrimoniales sobre una compra de 200.000 € "
                "como vivienda habitual, 2026"),
        "case": ("Caso tipo: comprador de 41 años o más, sin familia numerosa ni discapacidad, primera vivienda, con hipoteca "
                 "y fuera de zonas despobladas. Los tipos reducidos por edad, familia numerosa o discapacidad "
                 "rebajan la factura en casi todas las comunidades."),
        "legend": "ITP efectivo sobre 200.000 €",
        "cheapest": "Más barato",
        "dearest": "Más caro",
        "spread_lbl": "Entre la comunidad más barata\ny la más cara hay una diferencia de",
        "src": "Fuente: normativa autonómica y foral vigente (BOE, boletines autonómicos y normas forales), recopilada en hipotecalc.com/itp · Revisado 06/09/2026",
        "brand": "hipotecalc.com",
        "canarias": "Canarias",
        "ccyl": "Castilla\ny León",
        "clm": "Castilla-\nLa Mancha",
        "cval": "C. Valenciana",
    },
    "en": {
        "title": "Property transfer tax on a resale home, by Spanish region",
        "sub": ("ITP transfer tax payable on a €200,000 resale home bought as a main residence, 2026"),
        "case": ("Standard case: buyer aged 41 or over, not a large family, no disability, first main home, with a mortgage "
                 "and outside designated rural zones. Reduced rates for young buyers, large families and "
                 "disability lower the bill in almost every region."),
        "legend": "Effective ITP on €200,000",
        "cheapest": "Cheapest",
        "dearest": "Most expensive",
        "spread_lbl": "The gap between the cheapest\nand the most expensive region is",
        "src": "Source: regional and foral legislation in force (BOE, regional gazettes and foral rules), compiled at hipotecalc.com/itp · Reviewed 6 September 2026",
        "brand": "hipotecalc.com",
        "canarias": "Canary Islands",
        "ccyl": "Castilla\ny León",
        "clm": "Castilla-\nLa Mancha",
        "cval": "Valencia",
    },
}

# Sequential blue ramp, light -> dark (validated palette)
RAMP = ["#cde2fb", "#b7d3f6", "#9ec5f4", "#86b6ef", "#6da7ec", "#5598e7",
        "#3987e5", "#2a78d6", "#256abf", "#1c5cab", "#184f95", "#104281", "#0d366b"]

INK = "#0b0b0b"
INK2 = "#52514e"
MUTED = "#898781"
SURFACE = "#fcfcfb"
GRID = "#e1e0d9"
SEA = "#f2f1ed"


def color_for(pct, lo=3.0, hi=10.0):
    """Map a percentage onto the sequential ramp."""
    t = (pct - lo) / (hi - lo)
    t = max(0.0, min(1.0, t))
    # use steps 1..12 so the lightest never fully disappears into the surface
    idx = int(round(t * (len(RAMP) - 2))) + 1
    return RAMP[idx]


def text_on(hexcolor):
    """Readable ink for a given fill."""
    h = hexcolor.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    def lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
    return "#ffffff" if L < 0.42 else INK


def eur(v, lang="es"):
    if lang == "es":
        return f"{v:,.0f} €".replace(",", ".")
    return f"€{v:,.0f}"


def pct(v, lang="es"):
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    if lang == "es":
        s = s.replace(".", ",")
    return s + " %"
