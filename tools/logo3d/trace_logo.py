"""
Strativu loqosunu JPEG-dən vektor konturlara çevirir.
Çıxış: mark.json  (silhouette / inner / lines / circles, 0..100 koordinat sistemində)
       trace-check.png (yoxlama üçün geri çəkilmiş şəkil)
"""
import json
import math
import numpy as np
from PIL import Image, ImageDraw

SRC = r"C:\Users\User\Downloads\strativu-site\strativu\public\brand\logo-source.jpeg"
OUT_JSON = r"C:\Users\User\AppData\Local\Temp\claude\C--Users-User-Downloads-strativu-site\e65fa17d-1faf-47a2-a05c-16b4108e9cd6\scratchpad\mark.json"
OUT_PNG = r"C:\Users\User\AppData\Local\Temp\claude\C--Users-User-Downloads-strativu-site\e65fa17d-1faf-47a2-a05c-16b4108e9cd6\scratchpad\trace-check.png"

# ─────────────────────────── yükləmə və kəsim ───────────────────────────
im = Image.open(SRC).convert("RGB")
a = np.asarray(im).astype(np.int16)
lum = a.max(axis=2)
mask_all = lum > 45

ys, xs = np.nonzero(mask_all[:, :520])          # yalnız mark hissəsi
y0, y1 = ys.min() - 4, ys.max() + 5
x0, x1 = xs.min() - 4, xs.max() + 5
crop = a[y0:y1, x0:x1]
H, W = crop.shape[:2]
lum = crop.max(axis=2)
r, g, b = crop[..., 0], crop[..., 1], crop[..., 2]

blue = lum > 45                                  # mavi (nə qara fon, nə qara xətt)
deep = blue & (g < 150) & (b > 120)              # tünd mavi: içəri dağ + aşağı kənarlar


# ─────────────────────────── morfologiya (numpy) ───────────────────────────
def shift_or(m, dy, dx):
    out = np.zeros_like(m)
    ys_ = slice(max(0, dy), H + min(0, dy))
    xs_ = slice(max(0, dx), W + min(0, dx))
    yt = slice(max(0, -dy), H + min(0, -dy))
    xt = slice(max(0, -dx), W + min(0, -dx))
    out[ys_, xs_] = m[yt, xt]
    return out


def disk(radius):
    return [(dy, dx) for dy in range(-radius, radius + 1) for dx in range(-radius, radius + 1)
            if dy * dy + dx * dx <= radius * radius]


def dilate(m, radius):
    out = np.zeros_like(m)
    for dy, dx in disk(radius):
        out |= shift_or(m, dy, dx)
    return out


def erode(m, radius):
    return ~dilate(~m, radius)


def fill_holes(m):
    """Kənardan flood fill → çatmayan fon pikselləri deşikdir."""
    free = ~m
    reach = np.zeros_like(m)
    stack = []
    for x in range(W):
        for y in (0, H - 1):
            if free[y, x]:
                stack.append((y, x))
    for y in range(H):
        for x in (0, W - 1):
            if free[y, x]:
                stack.append((y, x))
    while stack:
        y, x = stack.pop()
        if reach[y, x] or not free[y, x]:
            continue
        reach[y, x] = True
        if y > 0: stack.append((y - 1, x))
        if y < H - 1: stack.append((y + 1, x))
        if x > 0: stack.append((y, x - 1))
        if x < W - 1: stack.append((y, x + 1))
    return m | (free & ~reach)


# qara xətlər siluetin içindən keçir → bağlayıb deşikləri doldururuq.
# Kontur yalnız PARLAQ mavidən götürülür və 2px içəri çəkilir: əks halda JPEG-in
# qara fonu mesh kənarına düşür və modelin ətrafında qara haşiyə yaranır.
vivid = lum > 125
closed = erode(dilate(vivid, 7), 7)
silhouette = erode(fill_holes(closed), 2)
lines = fill_holes(dilate(silhouette, 1)) & ~blue     # siluetin içindəki qara şəbəkə
lines = erode(dilate(lines, 1), 1)


# ─────────────────────────── komponentlər ───────────────────────────
def components(m, min_area=60):
    lab = np.zeros((H, W), dtype=np.int32)
    out = []
    cid = 0
    for sy in range(H):
        row = m[sy]
        for sx in range(W):
            if not row[sx] or lab[sy, sx]:
                continue
            cid += 1
            stack = [(sy, sx)]
            pix = []
            while stack:
                y, x = stack.pop()
                if lab[y, x] or not m[y, x]:
                    continue
                lab[y, x] = cid
                pix.append((y, x))
                if y > 0: stack.append((y - 1, x))
                if y < H - 1: stack.append((y + 1, x))
                if x > 0: stack.append((y, x - 1))
                if x < W - 1: stack.append((y, x + 1))
            if len(pix) >= min_area:
                out.append((cid, pix))
    return lab, out


# ─────────────────────────── kontur izləmə (Moore) ───────────────────────────
NB = [(-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1), (-1, -1)]


def trace_contour(m, start):
    sy, sx = start
    contour = [(sy, sx)]
    b_idx = 6
    cur = (sy, sx)
    for _ in range(200000):
        found = False
        for k in range(8):
            i = (b_idx + 1 + k) % 8
            ny, nx = cur[0] + NB[i][0], cur[1] + NB[i][1]
            if 0 <= ny < H and 0 <= nx < W and m[ny, nx]:
                b_idx = (i + 4) % 8
                cur = (ny, nx)
                found = True
                break
        if not found:
            break
        if cur == (sy, sx) and len(contour) > 2:
            break
        contour.append(cur)
    return contour


def outer_contour(mask_component):
    ys_ = np.nonzero(mask_component.any(axis=1))[0]
    row = int(ys_[0])
    col = int(np.nonzero(mask_component[row])[0][0])
    return trace_contour(mask_component, (row, col))


def rdp(points, eps):
    """Iterativ Ramer–Douglas–Peucker (açıq zəncir üçün)."""
    n = len(points)
    if n < 3:
        return list(points)
    keep = [False] * n
    keep[0] = keep[n - 1] = True
    stack = [(0, n - 1)]
    while stack:
        i0, i1 = stack.pop()
        if i1 <= i0 + 1:
            continue
        x1, y1 = points[i0]
        x2, y2 = points[i1]
        dx, dy = x2 - x1, y2 - y1
        norm = math.hypot(dx, dy)
        dmax, idx = -1.0, -1
        for i in range(i0 + 1, i1):
            x0, y0 = points[i]
            if norm < 1e-9:
                d = math.hypot(x0 - x1, y0 - y1)
            else:
                d = abs(dy * x0 - dx * y0 + x2 * y1 - y2 * x1) / norm
            if d > dmax:
                dmax, idx = d, i
        if dmax > eps and idx > i0:
            keep[idx] = True
            stack.append((i0, idx))
            stack.append((idx, i1))
    return [p for p, k in zip(points, keep) if k]


def to_poly(contour, eps=1.4):
    """Qapalı konturu iki açıq zəncirə bölüb sadələşdiririk."""
    pts = [(float(x), float(y)) for y, x in contour]
    if len(pts) < 8:
        return pts
    x0, y0 = pts[0]
    far = max(range(len(pts)), key=lambda i: (pts[i][0] - x0) ** 2 + (pts[i][1] - y0) ** 2)
    first = rdp(pts[:far + 1], eps)
    second = rdp(pts[far:] + [pts[0]], eps)
    return first[:-1] + second[:-1]


# ─────────────────────────── dairələr ───────────────────────────
def find_circles(m):
    """Dəyirmi komponentlər: bbox kvadrat, doluluq ~0.785."""
    _, comps = components(m, min_area=400)
    found = []
    for _, pix in comps:
        arr = np.array(pix)
        yy, xx = arr[:, 0], arr[:, 1]
        h = yy.max() - yy.min() + 1
        w = xx.max() - xx.min() + 1
        if h == 0 or w == 0:
            continue
        aspect = w / h
        fill = len(pix) / (w * h)
        if 0.82 < aspect < 1.22 and 0.68 < fill < 0.92:
            found.append({
                "cx": float((xx.min() + xx.max()) / 2),
                "cy": float((yy.min() + yy.max()) / 2),
                "r": float((w + h) / 4),
                "area": len(pix),
            })
    return found


circles = find_circles(blue)
circles.sort(key=lambda c: -c["area"])
circles = circles[:3]

# ─────────────────────────── konturların çıxarılması ───────────────────────────
lab_s, comps_s = components(silhouette, min_area=2000)
comps_s.sort(key=lambda c: -len(c[1]))
body_mask = lab_s == comps_s[0][0]
body = to_poly(outer_contour(body_mask), eps=1.2)

lab_d, comps_d = components(deep & ~lines, min_area=1500)
comps_d.sort(key=lambda c: -len(c[1]))
inner = [to_poly(outer_contour(lab_d == cid), eps=1.6) for cid, _ in comps_d[:2]]

lab_l, comps_l = components(lines, min_area=300)
line_polys = [to_poly(outer_contour(lab_l == cid), eps=1.0) for cid, _ in comps_l]

# ── tekstura üçün dəqiq kəsim (mesh koordinatları ilə eyni sistem) ──
Image.fromarray(crop.astype(np.uint8)).save(
    r"C:\Users\User\Downloads\strativu-site\strativu\public\brand\mark-texture.png"
)

data = {
    "size": [W, H],
    "crop": [int(x0), int(y0), int(x1), int(y1)],
    "body": body,
    "inner": inner,
    "lines": line_polys,
    "circles": circles,
}
with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(data, f)

print("W,H", W, H)
print("body pts", len(body))
print("inner shapes", [len(p) for p in inner])
print("line shapes", len(line_polys), [len(p) for p in line_polys][:8])
print("circles", [(round(c["cx"]), round(c["cy"]), round(c["r"], 1)) for c in circles])

# ─────────────────────────── yoxlama şəkli ───────────────────────────
check = Image.new("RGB", (W, H), (8, 10, 16))
d = ImageDraw.Draw(check)
d.polygon(body, fill=(40, 150, 235))
for poly in inner:
    if len(poly) > 2:
        d.polygon(poly, fill=(20, 80, 190))
for poly in line_polys:
    if len(poly) > 2:
        d.polygon(poly, fill=(10, 14, 22))
for c in circles:
    d.ellipse([c["cx"] - c["r"], c["cy"] - c["r"], c["cx"] + c["r"], c["cy"] + c["r"]], fill=(120, 225, 255))
check.resize((W * 2, H * 2), Image.LANCZOS).save(OUT_PNG)
print("saved", OUT_PNG)
