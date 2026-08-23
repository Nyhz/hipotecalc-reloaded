# -*- coding: utf-8 -*-
"""
ITP efectivo por territorio — caso tipo.

CASO TIPO
  Vivienda usada de 200.000 €, comprada como vivienda habitual y financiada
  con hipoteca, por un comprador de 41 años o más que no pertenece a ningún
  colectivo con tipo reducido (no familia numerosa ni monoparental, sin
  discapacidad, no víctima de violencia de género) y fuera de zonas de
  despoblación.

  La edad se fija en 41+ porque Cantabria, La Rioja, Murcia y Canarias
  mantienen tipos de joven hasta los 40 años inclusive.

Todos los tipos proceden de las páginas de ITP de hipotecalc.com
(actualizadas a julio de 2026) y han sido verificados de forma independiente
contra los textos consolidados (BOE, DOCM, Lexnavarra, normas forales).
"""

BASE = 200_000

# key: Natural Earth 'region' value (or province name for País Vasco / ciudades)
# value: (display name ES, display name EN, effective %, footnote marker)
ITP = {
    "Cataluña":            ("Cataluña",            "Catalonia",           10.00, ""),
    "Valenciana":          ("C. Valenciana",       "Valencia",             9.00, ""),
    "Aragón":              ("Aragón",              "Aragón",               8.00, ""),
    "Asturias":            ("Asturias",            "Asturias",             8.00, ""),
    "Castilla y León":     ("Castilla y León",     "Castilla y León",      8.00, ""),
    "Murcia":              ("Murcia",              "Murcia",               7.75, ""),
    "Andalucía":           ("Andalucía",           "Andalusia",            7.00, ""),
    "Cantabria":           ("Cantabria",           "Cantabria",            7.00, ""),
    "Extremadura":         ("Extremadura",         "Extremadura",          7.00, "²"),
    "Galicia":             ("Galicia",             "Galicia",              7.00, "³"),
    "La Rioja":            ("La Rioja",            "La Rioja",             7.00, ""),
    "Castilla-La Mancha":  ("Castilla-La Mancha",  "Castilla-La Mancha",   6.00, "¹"),
    "Foral de Navarra":    ("Navarra",             "Navarre",              6.00, ""),
    "Madrid":              ("Madrid",              "Madrid",               5.40, "⁴"),
    "Canary Is.":          ("Canarias",            "Canary Islands",       5.00, ""),
    "Islas Baleares":      ("Baleares",            "Balearic Islands",     4.00, ""),
    # País Vasco — three foral territories, same rate for vivienda
    "Álava":               ("Álava",               "Álava",                4.00, "⁵"),
    "Bizkaia":             ("Bizkaia",             "Bizkaia",              4.00, "⁵"),
    "Gipuzkoa":            ("Gipuzkoa",            "Gipuzkoa",             4.00, "⁵"),
    "Ceuta":               ("Ceuta",               "Ceuta",                3.00, ""),
    "Melilla":             ("Melilla",             "Melilla",              3.00, ""),
}

# Provinces that must NOT be dissolved into their region (kept individually)
KEEP_PROVINCE = {"Álava", "Bizkaia", "Gipuzkoa", "Ceuta", "Melilla"}

FOOTNOTES_ES = [
    "¹ Castilla-La Mancha: el 6 % exige financiar más del 50 % con hipoteca sobre el inmueble; en otro caso, 9 %.",
    "² Extremadura: el 7 % exige base imponible de IRPF ≤ 30.000 € (individual) o 55.000 € (conjunta); en otro caso, 8 %.",
    "³ Galicia: el 7 % exige que el patrimonio de la unidad familiar no supere 240.000 €; en otro caso, 8 %.",
    "⁴ Madrid: tipo general del 6 % con la bonificación del 10 % de la cuota por vivienda habitual ≤ 250.000 €.",
    "⁵ País Vasco: 4 % para vivienda en general. Baja al 2,5 % si la vivienda habitual tiene ≤ 120 m² construidos.",
]

FOOTNOTES_EN = [
    "¹ Castilla-La Mancha: the 6 % rate requires financing over 50 % of the purchase with a mortgage; otherwise 9 %.",
    "² Extremadura: the 7 % rate requires income tax base ≤ €30,000 (individual) or €55,000 (joint); otherwise 8 %.",
    "³ Galicia: the 7 % rate requires household wealth not to exceed €240,000; otherwise 8 %.",
    "⁴ Madrid: 6 % general rate with the 10 % tax-credit for a main home valued ≤ €250,000.",
    "⁵ Basque Country: 4 % for housing generally. Falls to 2.5 % for a main home of ≤ 120 m² built area.",
]

TXT = {
    "es": {
        "title": "Cuánto ITP se paga al comprar vivienda usada, por comunidad",
        "sub": ("Impuesto de Transmisiones Patrimoniales sobre una compra de 200.000 € "
                "como vivienda habitual, 2026"),
        "case": ("Caso tipo: comprador de 41 años o más, sin familia numerosa ni discapacidad, con hipoteca "
                 "y fuera de zonas despobladas. Los tipos reducidos por edad, familia numerosa o discapacidad "
                 "rebajan la factura en casi todas las comunidades."),
        "legend": "ITP efectivo sobre 200.000 €",
        "cheapest": "Más barato",
        "dearest": "Más caro",
        "spread_lbl": "Entre la comunidad más barata\ny la más cara hay una diferencia de",
        "src": "Fuente: normativa autonómica y foral vigente (BOE, boletines autonómicos y normas forales), recopilada en hipotecalc.com/itp · Actualizado a agosto de 2026",
        "brand": "hipotecalc.com",
        "canarias": "Canarias",
        "ccyl": "Castilla\ny León",
        "clm": "Castilla-\nLa Mancha",
        "cval": "C. Valenciana",
    },
    "en": {
        "title": "Property transfer tax on a resale home, by Spanish region",
        "sub": ("ITP transfer tax payable on a €200,000 resale home bought as a main residence, 2026"),
        "case": ("Standard case: buyer aged 41 or over, not a large family, no disability, with a mortgage "
                 "and outside designated rural zones. Reduced rates for young buyers, large families and "
                 "disability lower the bill in almost every region."),
        "legend": "Effective ITP on €200,000",
        "cheapest": "Cheapest",
        "dearest": "Most expensive",
        "spread_lbl": "The gap between the cheapest\nand the most expensive region is",
        "src": "Source: regional and foral legislation in force (BOE, regional gazettes and foral rules), compiled at hipotecalc.com/itp · Updated August 2026",
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
