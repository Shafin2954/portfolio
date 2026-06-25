"""
Scatter + polynomial regression + piecewise outline + Delaunay mesh -> transparent PNG.

Edit POINTS, then flip toggles to export each domain panel:
  Analyst  : SHOW_REGRESSION=True,  SHOW_OUTLINE=False, SHOW_MESH=False
  Builder  : SHOW_MESH=True,        SHOW_OUTLINE=False, SHOW_REGRESSION=False
  Designer : SHOW_OUTLINE=True,     OUTLINE_FILL=True,  SHOW_MESH=False, SHOW_REGRESSION=False
"""

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# ============================ TWEAK HERE ============================
POINTS = [
    (9.2, 5.6),  # beak
    (8.7, 6.0),  # crown
    (8.0, 5.7),  # nape
    (6.8, 6.2),  # far wing, leading
    (4.6, 6.9),  # far wingtip  (up)
    (6.2, 5.3),  # far wing, trailing
    (5.3, 4.9),  # back
    (2.2, 5.1),  # tail streamer, upper
    (3.0, 4.3),  # tail fork notch
    (1.6, 3.6),  # tail streamer, lower
    (4.4, 3.9),  # belly
    (5.6, 3.7),  # near wing, trailing
    (6.6, 2.2),  # near wingtip  (down)
    (7.4, 4.2),  # near wing, leading
    (8.4, 4.8),  # throat
]

# --- what to draw ---
SHOW_POINTS     = True
SHOW_REGRESSION = False     # Analyst : polynomial fit through the cloud
SHOW_MESH       = True      # Builder : Delaunay triangulation of the points
SHOW_OUTLINE    = False     # Designer: connect points in order (piecewise)
CLOSE_OUTLINE   = True
OUTLINE_FILL    = False      # fill the closed outline (a base coat for Designer)
SHOW_BAND       = False
SHOW_AXES       = False
EQUAL_ASPECT    = True       # keep True for shapes
MESH_FILL       = False      # faint fill inside each triangle

DEGREE     = 3
OUT        = "regression.png"
DPI        = 300
FIGSIZE    = (8, 6)

COL_POINT   = "#2A2520"
COL_LINE    = "#C4600A"     # regression
COL_OUTLINE = "#2A2520"     # outline stroke
COL_FILL    = "#C4600A"     # outline fill (Designer base)
COL_MESH    = "#6f675c"     # mesh edges (mono, technical)
COL_BAND    = "#C4600A"

POINT_SIZE    = 46
LINE_WIDTH    = 2.6
OUTLINE_WIDTH = 2.0
MESH_WIDTH    = 1.0
FILL_ALPHA    = 0.12
MARGIN        = 0.06
# ===================================================================

pts = np.asarray(POINTS, dtype=float)
x, y = pts[:, 0], pts[:, 1]

fig, ax = plt.subplots(figsize=FIGSIZE)
fig.patch.set_alpha(0)
ax.patch.set_alpha(0)

# --- Builder: Delaunay mesh ---
if SHOW_MESH:
    try:
        from scipy.spatial import Delaunay
        simplices = Delaunay(pts).simplices
    except Exception:
        import matplotlib.tri as mtri
        simplices = mtri.Triangulation(x, y).triangles
    if MESH_FILL:
        for s in simplices:
            ax.fill(x[s], y[s], color=COL_MESH, alpha=0.05, linewidth=0, zorder=0)
    ax.triplot(x, y, simplices, color=COL_MESH, linewidth=MESH_WIDTH, zorder=1)

# --- Analyst: regression ---
if SHOW_REGRESSION:
    coeffs = np.polyfit(x, y, DEGREE)
    model  = np.poly1d(coeffs)
    xs = np.linspace(x.min(), x.max(), 400)
    ys = model(xs)
    if SHOW_BAND:
        sd = (y - model(x)).std()
        ax.fill_between(xs, ys - sd, ys + sd, color=COL_BAND, alpha=0.12, linewidth=0)
    ax.plot(xs, ys, color=COL_LINE, linewidth=LINE_WIDTH, solid_capstyle="round", zorder=2)

# --- Designer: outline (optionally filled) ---
if SHOW_OUTLINE:
    ox, oy = list(x), list(y)
    if CLOSE_OUTLINE:
        ox, oy = ox + [x[0]], oy + [y[0]]
    if OUTLINE_FILL:
        ax.fill(ox, oy, color=COL_FILL, alpha=FILL_ALPHA, linewidth=0, zorder=1)
    ax.plot(ox, oy, color=COL_OUTLINE, linewidth=OUTLINE_WIDTH,
            solid_capstyle="round", solid_joinstyle="round", zorder=2)

if SHOW_POINTS:
    ax.scatter(x, y, s=POINT_SIZE, color=COL_POINT, edgecolors="none", zorder=3)

dx = (x.max() - x.min()) * MARGIN
dy = (y.max() - y.min()) * MARGIN
ax.set_xlim(x.min() - dx, x.max() + dx)
ax.set_ylim(y.min() - dy, y.max() + dy)
if EQUAL_ASPECT:
    ax.set_aspect("equal")

if SHOW_AXES:
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
    for s in ("left", "bottom"):
        ax.spines[s].set_color(COL_POINT)
    ax.tick_params(colors=COL_POINT, labelsize=9)
else:
    ax.axis("off")

fig.savefig(OUT, transparent=True, dpi=DPI, bbox_inches="tight", pad_inches=0.02)

msg = f"saved {OUT}"
if SHOW_REGRESSION:
    r2 = 1 - ((y - model(x))**2).sum() / ((y - y.mean())**2).sum()
    msg += f"  |  deg {DEGREE}  |  R^2 = {r2:.4f}"
if SHOW_MESH:
    msg += f"  |  {len(simplices)} triangles"
print(msg)