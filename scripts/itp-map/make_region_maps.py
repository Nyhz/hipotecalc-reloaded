# -*- coding: utf-8 -*-
"""Genera el mapa del ITP con UNA región resaltada, por comunidad e idioma.

Reutiliza make_map.py (etiquetas auto-colocadas, panel, pie) y solo cambia:
  - relleno atenuado para las regiones no resaltadas (la resaltada conserva su
    color de la rampa y lleva borde oscuro);
  - título por comunidad;
  - fila de la comunidad en negrita en el panel.

Salida: public/img/itp/{es,en}/{slug}.png (1800 px de ancho, paleta 256).
Requiere el shapefile Natural Earth 10m admin-1 en scripts/itp-map/ne10m/
(no se versiona; descarga: naciscdn.org/naturalearth/10m/cultural/).
Uso: python3 scripts/itp-map/make_region_maps.py [slug ...]
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import make_map as mm
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon as MplPoly, Rectangle
from matplotlib.collections import PatchCollection
from PIL import Image
from itp_data import ITP, TXT, INK, INK2, MUTED, color_for, eur, pct

mm.SHP = os.path.join(HERE, 'ne10m', 'ne_10m_admin_1_states_provinces')
OUT = os.path.join(HERE, '..', '..', 'public', 'img', 'itp')

# slug del sitio → claves del shapefile/ITP (y nombre legible por idioma)
REGIONES = {
    'andalucia':            (['Andalucía'], 'Andalucía', 'Andalusia', 'andalusia'),
    'aragon':               (['Aragón'], 'Aragón', 'Aragon', 'aragon'),
    'asturias':             (['Asturias'], 'Asturias', 'Asturias', 'asturias'),
    'baleares':             (['Islas Baleares'], 'Baleares', 'the Balearic Islands', 'balearic-islands'),
    'canarias':             (['Canary Is.'], 'Canarias', 'the Canary Islands', 'canary-islands'),
    'cantabria':            (['Cantabria'], 'Cantabria', 'Cantabria', 'cantabria'),
    'castilla-la-mancha':   (['Castilla-La Mancha'], 'Castilla-La Mancha', 'Castilla-La Mancha', 'castilla-la-mancha'),
    'castilla-y-leon':      (['Castilla y León'], 'Castilla y León', 'Castilla y León', 'castilla-y-leon'),
    'cataluna':             (['Cataluña'], 'Cataluña', 'Catalonia', 'catalonia'),
    'ceuta-melilla':        (['Ceuta', 'Melilla'], 'Ceuta y Melilla', 'Ceuta and Melilla', 'ceuta-melilla'),
    'comunidad-valenciana': (['Valenciana'], 'la Comunitat Valenciana', 'the Valencian Community', 'valencian-community'),
    'extremadura':          (['Extremadura'], 'Extremadura', 'Extremadura', 'extremadura'),
    'galicia':              (['Galicia'], 'Galicia', 'Galicia', 'galicia'),
    'la-rioja':             (['La Rioja'], 'La Rioja', 'La Rioja', 'la-rioja'),
    'madrid':               (['Madrid'], 'Madrid', 'Madrid', 'madrid'),
    'murcia':               (['Murcia'], 'Murcia', 'Murcia', 'murcia'),
    'navarra':              (['Foral de Navarra'], 'Navarra', 'Navarre', 'navarre'),
    'pais-vasco':           (['Álava', 'Bizkaia', 'Gipuzkoa'], 'el País Vasco', 'the Basque Country', 'basque-country'),
}
DIM = "#dfe3ea"      # relleno de las regiones no resaltadas
_HL = set()          # claves resaltadas en la pasada actual

_draw_map_orig = mm.draw_map

def draw_map_highlight(ax, geoms, lang):
    """Copia de make_map.draw_map con relleno atenuado fuera de la región."""
    patches, meta = [], {}
    pen = [k for k in geoms if k not in ("Canary Is.", "Ceuta", "Melilla")]
    pxs, pys = [], []
    for k in pen:
        for r in mm.rings_of(geoms[k]):
            pxs += [p[0] for p in r]; pys += [p[1] for p in r]
    PX0, PY0 = min(pxs), min(pys)
    cx, cy = mm.lcc(-15.6, 28.3)
    crr = mm.rings_of(geoms["Canary Is."])
    cX0 = min(p[0] for r in crr for p in r)
    cY0 = min(p[1] for r in crr for p in r)
    CAN = dict(scale=0.92, ox=cx, oy=cy, dx=(PX0 - 330) - cX0, dy=(PY0 - 245) - cY0)
    resaltadas = []
    for key, g in geoms.items():
        nm_es, nm_en, val, mark = ITP[key]
        hl = key in _HL
        fill = color_for(val) if hl else DIM
        if key == "Canary Is.":
            rr = mm.rings_of(g, **CAN)
        elif key in ("Ceuta", "Melilla"):
            c = g.centroid
            ox, oy = mm.lcc(c.x, c.y)
            rr = mm.rings_of(g, scale=11.0, ox=ox, oy=oy)
        else:
            rr = mm.rings_of(g)
        for ring in rr:
            p = MplPoly(ring, closed=True, facecolor=fill,
                        edgecolor=INK if hl else mm.SURFACE, linewidth=2.2 if hl else 1.5)
            (resaltadas if hl else patches).append(p)
        meta[key] = dict(rings=rr, fill=fill, val=val, mark=mark,
                         name=nm_es if lang == "es" else nm_en)
    ax.add_collection(PatchCollection(patches, match_original=True, zorder=2))
    ax.add_collection(PatchCollection(resaltadas, match_original=True, zorder=3))
    ax.set_aspect("equal"); ax.autoscale_view(); ax.set_axis_off()
    x0, x1 = ax.get_xlim(); y0, y1 = ax.get_ylim()
    ax.set_xlim(x0 - 60, x1 + 250); ax.set_ylim(y0 - 95, y1 + 250)
    return meta, CAN

def draw_panel_highlight(fig, ax, lang):
    T = TXT[lang]
    rows = sorted(({"k": k, "nm": (v[0] if lang == "es" else v[1]), "v": v[2], "m": v[3]}
                   for k, v in ITP.items()), key=lambda r: (-r["v"], r["nm"]))
    ax.set_axis_off(); ax.set_xlim(0, 1); ax.set_ylim(0, 1)
    top, bot = 0.945, 0.045
    step = (top - bot) / len(rows)
    ax.text(0.0, 0.99, T["legend"], fontsize=13.5, color=INK2, ha="left", va="top", fontweight="600")
    for i, r in enumerate(rows):
        y = top - i * step - step / 2
        hl = r["k"] in _HL
        if hl:
            ax.add_patch(Rectangle((-0.02, y - step / 2), 1.04, step, facecolor="#fff7cc",
                                   edgecolor="none", zorder=0))
        ax.text(0.0, y, r["nm"], fontsize=12.2, color=INK if hl else INK2, ha="left",
                va="center", fontweight="bold" if hl else "normal")
        ax.text(0.545, y, eur(2000 * r["v"], lang), fontsize=11.4, color=MUTED, ha="right", va="center")
        bw = 0.215 * (r["v"] / 10.0)
        ax.add_patch(Rectangle((0.585, y - 0.0088), bw, 0.0176,
                               facecolor=color_for(r["v"]) if hl else DIM, edgecolor="none"))
        ax.text(0.945, y, pct(r["v"], lang), fontsize=12.4, color=INK, ha="right",
                va="center", fontweight="bold")
        if r["m"]:
            ax.text(0.957, y + 0.005, r["m"], fontsize=10, color=MUTED, ha="left", va="center")

mm.draw_map = draw_map_highlight
mm.draw_panel = draw_panel_highlight

def generar(slug):
    claves, nombre_es, nombre_en, slug_en = REGIONES[slug]
    global _HL
    _HL = set(claves)
    for lang, nombre, out_slug in (("es", nombre_es, slug), ("en", nombre_en, slug_en)):
        titulo_orig = TXT[lang]["title"]
        TXT[lang]["title"] = (f"Cuánto ITP se paga en {nombre} frente al resto de España"
                              if lang == "es" else
                              f"Property transfer tax in {nombre} vs the rest of Spain")
        try:
            fig = mm.build(lang)
        finally:
            TXT[lang]["title"] = titulo_orig
        tmp = os.path.join(HERE, f"_tmp_{lang}.png")
        fig.savefig(tmp, dpi=150, facecolor=mm.SURFACE)
        plt.close(fig)
        im = Image.open(tmp).convert("RGB")
        w, h = im.size
        im = im.resize((1800, round(h * 1800 / w)), Image.LANCZOS)
        os.makedirs(os.path.join(OUT, lang), exist_ok=True)
        dest = os.path.join(OUT, lang, f"{out_slug}.png")
        im.quantize(colors=256, method=Image.MEDIANCUT).save(dest, optimize=True)
        # variantes responsive WebP (las consume el <picture> de las plantillas)
        for w in (800, 1200, 1800):
            h = round(im.size[1] * w / im.size[0])
            (im if w == im.size[0] else im.resize((w, h), Image.LANCZOS)).save(
                dest[:-4] + f"-{w}.webp", "WEBP", quality=82, method=6)
        os.remove(tmp)
        print(f"  {lang}/{out_slug}.png  {os.path.getsize(dest)//1024} KB (+3 webp)")

if __name__ == "__main__":
    slugs = sys.argv[1:] or list(REGIONES)
    for s in slugs:
        print(f"[{s}]")
        generar(s)
