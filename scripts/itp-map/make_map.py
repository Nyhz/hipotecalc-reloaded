# -*- coding: utf-8 -*-
"""High-resolution ITP choropleth of Spain + ranked panel.

Label placement is computed rather than hand-tuned:
  1. For every region, find the pole of inaccessibility (the interior point
     furthest from the boundary) and the radius of the inscribed circle there.
  2. Measure the real rendered size of the candidate label.
  3. If name + value fit inside that circle, draw both in place. If only the
     value fits, drop the name. If neither fits, push the label into a gutter
     outside the map and join it with a leader line.
"""
import sys, math
sys.path.insert(0, '/home/claude/seo/img')
import shapefile
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon as MplPoly, Rectangle
from matplotlib.collections import PatchCollection
from shapely.geometry import shape, MultiPolygon, Point, Polygon as ShPoly
from shapely.ops import unary_union
from itp_data import (ITP, KEEP_PROVINCE, TXT, INK, INK2, MUTED, SURFACE, SEA,
                      color_for, text_on, eur, pct, FOOTNOTES_ES, FOOTNOTES_EN)

SHP = '/home/claude/seo/ne10m/ne_10m_admin_1_states_provinces'
GRIDC = "#e1e0d9"
LEADC = "#a9a7a0"
LAT0, LON0, LAT1, LAT2 = 40.0, -3.7, 37.0, 43.0
R = 6371.0

FS_NAME, FS_VAL = 11.5, 16.5
FS_NAME_SM, FS_VAL_SM = 11.0, 14.5


def lcc(lon, lat):
    p1, p2 = math.radians(LAT1), math.radians(LAT2)
    p0, l0 = math.radians(LAT0), math.radians(LON0)
    n = (math.log(math.cos(p1) / math.cos(p2)) /
         math.log(math.tan(math.pi / 4 + p2 / 2) / math.tan(math.pi / 4 + p1 / 2)))
    F = math.cos(p1) * (math.tan(math.pi / 4 + p1 / 2) ** n) / n
    rho = lambda p: R * F / (math.tan(math.pi / 4 + p / 2) ** n)
    p, l = math.radians(lat), math.radians(lon)
    r, r0, th = rho(p), rho(p0), n * (l - l0)
    return r * math.sin(th), r0 - r * math.cos(th)


def rings_of(geom, scale=1.0, ox=0.0, oy=0.0, dx=0.0, dy=0.0):
    out = []
    for poly in (geom.geoms if isinstance(geom, MultiPolygon) else [geom]):
        ring = [lcc(x, y) for x, y in poly.exterior.coords]
        out.append([((x - ox) * scale + ox + dx, (y - oy) * scale + oy + dy) for x, y in ring])
    return out


def projected_polygon(rings):
    polys = [ShPoly(r) for r in rings if len(r) >= 4]
    polys = [p if p.is_valid else p.buffer(0) for p in polys]
    return max(polys, key=lambda p: p.area)


def pole_of_inaccessibility(poly, precision=5.0):
    """Interior point furthest from the boundary, and that distance."""
    minx, miny, maxx, maxy = poly.bounds
    cell = min(maxx - minx, maxy - miny) / 12.0
    if cell <= 0:
        c = poly.representative_point()
        return c.x, c.y, 0.0
    best, best_d = poly.representative_point(), -1.0
    while cell > precision:
        x = minx
        while x <= maxx:
            y = miny
            while y <= maxy:
                p = Point(x, y)
                if poly.contains(p):
                    d = poly.exterior.distance(p)
                    if d > best_d:
                        best_d, best = d, p
                y += cell
            x += cell
        minx, maxx = best.x - cell, best.x + cell
        miny, maxy = best.y - cell, best.y + cell
        cell /= 2.4
    return best.x, best.y, max(best_d, 0.0)


def load():
    sf = shapefile.Reader(SHP)
    flds = [f[0] for f in sf.fields[1:]]
    i_adm, i_name, i_reg = flds.index('admin'), flds.index('name'), flds.index('region')
    groups = {}
    for sr in sf.shapeRecords():
        rec = sr.record
        if rec[i_adm] != 'Spain':
            continue
        key = rec[i_name] if rec[i_name] in KEEP_PROVINCE else rec[i_reg]
        if key not in ITP:
            continue
        g = shape(sr.shape.__geo_interface__)
        groups.setdefault(key, []).append(g if g.is_valid else g.buffer(0))
    return {k: unary_union(v) for k, v in groups.items()}


def fig_text_width(fig, s, fontsize):
    """Width of a string in figure-fraction units."""
    r = fig.canvas.get_renderer()
    t = fig.text(0, 0, s, fontsize=fontsize, alpha=0)
    w = t.get_window_extent(renderer=r).width
    t.remove()
    return w / fig.bbox.width


def wrap_to_width(fig, s, fontsize, max_frac):
    """Greedy wrap using real glyph widths, so a line can never overrun."""
    words, lines, cur = s.split(), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if cur and fig_text_width(fig, trial, fontsize) > max_frac:
            lines.append(cur)
            cur = w
        else:
            cur = trial
    if cur:
        lines.append(cur)
    return "\n".join(lines)


def text_size(fig, ax, s, fontsize, weight="normal"):
    """Rendered size of a string, in map data units."""
    r = fig.canvas.get_renderer()
    t = ax.text(0, 0, s, fontsize=fontsize, fontweight=weight, alpha=0)
    bb = t.get_window_extent(renderer=r)
    t.remove()
    inv = ax.transData.inverted()
    (x0, y0), (x1, y1) = inv.transform([(bb.x0, bb.y0), (bb.x1, bb.y1)])
    return abs(x1 - x0), abs(y1 - y0)


# Always sent to the outer gutter: too small or too thin for any inside label.
FORCE_OUT = {"Cantabria", "Bizkaia", "Gipuzkoa", "Álava", "La Rioja",
             "Valenciana", "Islas Baleares", "Ceuta", "Melilla"}
GUTTER = {"Cantabria": "top", "Bizkaia": "top", "Gipuzkoa": "top",
          "Álava": "top", "La Rioja": "top",
          "Valenciana": "right", "Islas Baleares": "right",
          "Ceuta": "bottom", "Melilla": "bottom"}


def draw_map(ax, geoms, lang):
    patches, meta = [], {}
    pen = [k for k in geoms if k not in ("Canary Is.", "Ceuta", "Melilla")]
    pxs, pys = [], []
    for k in pen:
        for r in rings_of(geoms[k]):
            pxs += [p[0] for p in r]; pys += [p[1] for p in r]
    PX0, PY0 = min(pxs), min(pys)
    cx, cy = lcc(-15.6, 28.3)
    crr = rings_of(geoms["Canary Is."])
    cX0 = min(p[0] for r in crr for p in r)
    cY0 = min(p[1] for r in crr for p in r)
    CAN = dict(scale=0.92, ox=cx, oy=cy, dx=(PX0 - 330) - cX0, dy=(PY0 - 245) - cY0)

    for key, g in geoms.items():
        nm_es, nm_en, val, mark = ITP[key]
        fill = color_for(val)
        if key == "Canary Is.":
            rr = rings_of(g, **CAN)
        elif key in ("Ceuta", "Melilla"):
            c = g.centroid
            ox, oy = lcc(c.x, c.y)
            rr = rings_of(g, scale=11.0, ox=ox, oy=oy)
        else:
            rr = rings_of(g)
        for ring in rr:
            patches.append(MplPoly(ring, closed=True, facecolor=fill,
                                   edgecolor=SURFACE, linewidth=1.5))
        meta[key] = dict(rings=rr, fill=fill, val=val, mark=mark,
                         name=nm_es if lang == "es" else nm_en)

    ax.add_collection(PatchCollection(patches, match_original=True, zorder=2))
    ax.set_aspect("equal")
    ax.autoscale_view()
    ax.set_axis_off()
    x0, x1 = ax.get_xlim(); y0, y1 = ax.get_ylim()
    ax.set_xlim(x0 - 60, x1 + 250)
    ax.set_ylim(y0 - 95, y1 + 250)
    return meta, CAN


def _gutter_label(fig, ax, m, lang, sx0, sy0, lx, ly, route="v", small=False,
                  jog_off=0.0, min_jog_x=None):
    val_s = pct(m["val"], lang) + m["mark"]
    fs_n = FS_NAME_SM if small else FS_NAME
    fs_v = FS_VAL_SM if small else FS_VAL
    wv, hv = text_size(fig, ax, val_s, fs_v, "bold")
    wn, hn = text_size(fig, ax, m["name"], fs_n)
    half = max(wv, wn) / 2 + 15
    block_h = hv + hn + hv * 0.5

    if route == "v":
        up = ly > sy0
        end_y = ly - block_h * 0.62 if up else ly + block_h * 0.62
        # the horizontal jog always sits clear of every label block, and is
        # staggered per label so neighbouring jogs never merge into one rule
        jog = end_y - 20 - jog_off if up else end_y + 20 + jog_off
        ax.plot([sx0, sx0, lx, lx], [sy0, jog, jog, end_y],
                color=LEADC, lw=0.9, zorder=5, solid_joinstyle="round")
    else:
        midx = (sx0 + lx - half) / 2 + jog_off
        if min_jog_x is not None:
            midx = max(midx, min_jog_x)          # never turn on top of an island
        midx = min(midx, lx - half - 14)
        ax.plot([sx0, midx, midx, lx - half - 6], [sy0, sy0, ly, ly],
                color=LEADC, lw=0.9, zorder=5, solid_joinstyle="round")
    ax.scatter([sx0], [sy0], s=11, color=LEADC, zorder=6)

    # colour chip sits beside the text, never underneath it
    ax.add_patch(Rectangle((lx - half, ly - 9), 9, 18, facecolor=m["fill"],
                           edgecolor="none", zorder=6))
    ax.text(lx - half + 18, ly + hv * 0.58, m["name"], fontsize=fs_n, color=INK,
            ha="left", va="center", zorder=7)
    ax.text(lx - half + 18, ly - hn * 0.78, val_s, fontsize=fs_v, color=INK,
            ha="left", va="center", fontweight="bold", zorder=7)


def _box(cx, cy, w, h):
    return ShPoly([(cx - w / 2, cy - h / 2), (cx + w / 2, cy - h / 2),
                   (cx + w / 2, cy + h / 2), (cx - w / 2, cy + h / 2)])


def _best_spot(poly, px, py, rad, w, h):
    """Try the pole first, then a ring of offsets; return a centre that fits."""
    if poly.contains(_box(px, py, w, h)):
        return px, py
    for frac in (0.35, 0.6, 0.85):
        for ang in range(0, 360, 30):
            a = math.radians(ang)
            cx, cy = px + rad * frac * math.cos(a), py + rad * frac * math.sin(a)
            if poly.contains(_box(cx, cy, w, h)):
                return cx, cy
    return None


def place_labels(fig, ax, meta, lang):
    x0, x1 = ax.get_xlim(); y0, y1 = ax.get_ylim()
    cxm, cym = (x0 + x1) / 2, (y0 + y1) / 2
    anchors, outside, placed = {}, [], []
    PADX, PADY = 13, 8

    for key, m in meta.items():
        if key == "Canary Is.":
            continue
        poly = projected_polygon(m["rings"])
        px, py, rad = pole_of_inaccessibility(poly)
        anchors[key] = (px, py, rad)
        if key in FORCE_OUT:
            outside.append(key)
            continue

        val_s = pct(m["val"], lang) + m["mark"]
        wv, hv = text_size(fig, ax, val_s, FS_VAL, "bold")
        wn, hn = text_size(fig, ax, m["name"], FS_NAME)
        ink = text_on(m["fill"])

        # exact containment test: does the label's box fit inside the region?
        w_both, h_both = max(wv, wn) + PADX, hv + hn + hv * 0.5 + PADY
        spot = _best_spot(poly, px, py, rad, w_both, h_both)
        if spot:
            cx, cy = spot
            ax.text(cx, cy + hv * 0.60, m["name"], fontsize=FS_NAME, color=ink,
                    ha="center", va="center", zorder=7)
            ax.text(cx, cy - hn * 0.80, val_s, fontsize=FS_VAL, color=ink,
                    ha="center", va="center", fontweight="bold", zorder=7)
            placed.append((key, "name+value"))
            continue

        done = False
        for fs in (FS_VAL, FS_VAL_SM, 12.5):
            w, h = text_size(fig, ax, val_s, fs, "bold")
            spot = _best_spot(poly, px, py, rad, w + PADX, h + PADY)
            if spot:
                cx, cy = spot
                ax.text(cx, cy, val_s, fontsize=fs, color=ink,
                        ha="center", va="center", fontweight="bold", zorder=7)
                placed.append((key, "value only"))
                done = True
                break
        if not done:
            outside.append(key)

    # anything pushed outside without an explicit gutter gets one from geometry
    for k in outside:
        if k not in GUTTER:
            px, py, _ = anchors[k]
            GUTTER[k] = "top" if py > cym else "right"

    top = sorted([k for k in outside if GUTTER.get(k) == "top"],
                 key=lambda k: anchors[k][0])
    lo, hi = x0 + (x1 - x0) * 0.175, x0 + (x1 - x0) * 0.815
    ty = y1 - 74
    slots = [lo + (hi - lo) * i / max(1, len(top) - 1) for i in range(len(top))]
    runs = sorted(range(len(top)), key=lambda i: -abs(slots[i] - anchors[top[i]][0]))
    jogs = {}
    for rank, i in enumerate(runs):
        jogs[i] = rank * 13          # longest horizontal run sits highest
    for i, k in enumerate(top):
        px, py, _ = anchors[k]
        _gutter_label(fig, ax, meta[k], lang, px, py, slots[i], ty, route="v",
                      jog_off=jogs[i])
        placed.append((k, "gutter top"))

    right = sorted([k for k in outside if GUTTER.get(k) == "right"],
                   key=lambda k: -anchors[k][1])
    # Baleares keeps the top slot; the mainland labels sit clearly below the
    # islands so their horizontals never graze them
    ys_slots = [0.700, 0.475, 0.320]
    isl = max(p[0] for r in meta["Islas Baleares"]["rings"] for p in r) + 24
    for i, k in enumerate(right):
        px, py, _ = anchors[k]
        ty = y0 + (y1 - y0) * ys_slots[min(i, len(ys_slots) - 1)]
        _gutter_label(fig, ax, meta[k], lang, px, py, x1 - 96, ty, route="h",
                      jog_off=i * 26, min_jog_x=isl)
        placed.append((k, "gutter right"))

    for k in [k for k in outside if GUTTER.get(k) == "bottom"]:
        px, py, _ = anchors[k]
        _gutter_label(fig, ax, meta[k], lang, px, py, px, py - 92,
                      route="v", small=True)
        placed.append((k, "gutter bottom"))

    return placed


def canary_frame(fig, ax, geoms, meta, lang, CAN):
    rr = rings_of(geoms["Canary Is."], **CAN)
    xs = [p[0] for r in rr for p in r]; ys = [p[1] for r in rr for p in r]
    pad = 42
    ax.add_patch(Rectangle((min(xs) - pad, min(ys) - pad),
                           max(xs) - min(xs) + 2 * pad, max(ys) - min(ys) + 2 * pad,
                           fill=False, edgecolor=GRIDC, lw=1.1, zorder=1))
    m = meta["Canary Is."]
    val_s = pct(m["val"], lang) + m["mark"]
    wv, hv = text_size(fig, ax, val_s, FS_VAL, "bold")
    wn, hn = text_size(fig, ax, m["name"], FS_NAME)
    bx = min(xs) - pad
    cy = max(ys) + pad + 30 + hv          # block centre, clear of the frame
    ax.add_patch(Rectangle((bx, cy - 9), 9, 18, facecolor=m["fill"],
                           edgecolor="none", zorder=6))
    ax.text(bx + 18, cy + hv * 0.58, m["name"], fontsize=FS_NAME, color=INK,
            ha="left", va="center", zorder=7)
    ax.text(bx + 18, cy - hn * 0.78, val_s, fontsize=FS_VAL, color=INK,
            ha="left", va="center", fontweight="bold", zorder=7)


def draw_panel(fig, ax, lang):
    T = TXT[lang]
    rows = sorted(({"nm": (v[0] if lang == "es" else v[1]), "v": v[2], "m": v[3]}
                   for v in ITP.values()), key=lambda r: (-r["v"], r["nm"]))
    ax.set_axis_off()
    ax.set_xlim(0, 1); ax.set_ylim(0, 1)
    top, bot = 0.945, 0.045
    step = (top - bot) / len(rows)
    ax.text(0.0, 0.99, T["legend"], fontsize=13.5, color=INK2, ha="left",
            va="top", fontweight="600")
    for i, r in enumerate(rows):
        y = top - i * step - step / 2
        ax.text(0.0, y, r["nm"], fontsize=12.2, color=INK2, ha="left", va="center")
        ax.text(0.545, y, eur(2000 * r["v"], lang), fontsize=11.4, color=MUTED,
                ha="right", va="center")
        bw = 0.215 * (r["v"] / 10.0)
        ax.add_patch(Rectangle((0.585, y - 0.0088), bw, 0.0176,
                               facecolor=color_for(r["v"]), edgecolor="none"))
        # the value is right-aligned on a fixed edge and the footnote marker
        # lives in its own column, so markers can never shift the alignment
        ax.text(0.945, y, pct(r["v"], lang), fontsize=12.4, color=INK,
                ha="right", va="center", fontweight="bold")
        if r["m"]:
            ax.text(0.957, y + 0.005, r["m"], fontsize=10, color=MUTED,
                    ha="left", va="center")


def build(lang, report=False):
    T = TXT[lang]
    FN = FOOTNOTES_ES if lang == "es" else FOOTNOTES_EN
    geoms = load()

    fig = plt.figure(figsize=(16, 11), dpi=150)
    fig.patch.set_facecolor(SURFACE)

    fig.text(0.035, 0.962, T["title"], fontsize=24, color=INK, ha="left",
             va="top", fontweight="bold")
    fig.text(0.035, 0.917, T["sub"], fontsize=14.5, color=INK2, ha="left", va="top")
    fig.text(0.965, 0.917, T["brand"], fontsize=15, color=INK, ha="right",
             va="top", fontweight="bold")
    fig.add_artist(plt.Line2D([0.035, 0.965], [0.892, 0.892], color=GRIDC, lw=1.0))

    axm = fig.add_axes([0.010, 0.20, 0.650, 0.675])
    axm.set_facecolor(SURFACE)
    meta, CAN = draw_map(axm, geoms, lang)
    fig.canvas.draw()                       # renderer required for measurement
    placed = place_labels(fig, axm, meta, lang)
    canary_frame(fig, axm, geoms, meta, lang, CAN)

    axp = fig.add_axes([0.690, 0.205, 0.275, 0.665])
    draw_panel(fig, axp, lang)

    fig.add_artist(plt.Line2D([0.035, 0.965], [0.182, 0.182], color=GRIDC, lw=1.0))
    fig.text(0.035, 0.156, T["spread_lbl"], fontsize=11.5, color=INK2, ha="left", va="top")
    fig.text(0.035, 0.120, eur(14000, lang), fontsize=36, color=INK, ha="left",
             va="top", fontweight="bold")
    detail = (f"{pct(3, lang)} en Ceuta y Melilla\n{pct(10, lang)} en Cataluña"
              if lang == "es" else
              f"{pct(3, lang)} in Ceuta and Melilla\n{pct(10, lang)} in Catalonia")
    fig.text(0.035, 0.070, detail, fontsize=11.5, color=MUTED, ha="left",
             va="top", linespacing=1.6)

    # ---- bottom-right panel: size and position computed from its content ----
    PX, PW = 0.360, 0.605
    PAD_X, PAD_T, PAD_B = 0.016, 0.013, 0.011
    usable = PW - PAD_X * 2
    case_fs = 11.0
    while case_fs >= 9.5:
        case_lines = wrap_to_width(fig, T["case"], case_fs, usable).split("\n")
        if len(case_lines) <= 2:
            break
        case_fs -= 0.5
    fn_fs = 8.8
    fn_lines = []
    for f in FN:
        fn_lines += wrap_to_width(fig, f, fn_fs, usable).split("\n")

    LH = lambda fs, sp: (fs / 72.0) / 11.0 * sp      # line height in fig units
    case_lh, fn_lh = LH(case_fs, 1.45), LH(fn_fs, 1.20)
    gap = 0.008
    content_h = len(case_lines) * case_lh + gap + len(fn_lines) * fn_lh
    p_h = content_h + PAD_T + PAD_B
    p_top = 0.176
    p_bot = p_top - p_h

    fig.patches.append(Rectangle((PX, p_bot), PW, p_h, transform=fig.transFigure,
                                 facecolor=SEA, edgecolor="none", zorder=0))
    y = p_top - PAD_T
    fig.text(PX + PAD_X, y, "\n".join(case_lines), fontsize=case_fs, color=INK2,
             ha="left", va="top", linespacing=1.45, zorder=1)
    y -= len(case_lines) * case_lh + gap
    for i, line in enumerate(fn_lines):
        fig.text(PX + PAD_X, y - i * fn_lh, line, fontsize=fn_fs, color=MUTED,
                 ha="left", va="top", zorder=1)
    fig.text(0.035, 0.022, T["src"], fontsize=9, color=MUTED, ha="left", va="top")
    labelled = {k for k, _ in placed} | {"Canary Is."}
    missing = set(ITP) - labelled
    if missing:
        raise RuntimeError(f"territories with no label: {sorted(missing)}")
    dupes = len(placed) + 1 - len(labelled)
    if dupes:
        raise RuntimeError(f"{dupes} territories labelled more than once")
    if report:
        for k, how in sorted(placed, key=lambda z: (z[1], z[0])):
            print(f"    {how:14s} {k}")
        print(f"    ---- {len(labelled)} / {len(ITP)} territories labelled")
    return fig


if __name__ == "__main__":
    for lang in ("es", "en"):
        print(f"[{lang}]")
        f = build(lang, report=(lang == "es"))
        out = f"/home/claude/seo/img/itp-mapa-espana-2026-{lang}.png"
        f.savefig(out, dpi=150, facecolor=SURFACE)
        plt.close(f)
        print("  wrote", out)
