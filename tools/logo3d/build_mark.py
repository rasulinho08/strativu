"""
Strativu mark → 3D (Blender 5.2, background rejimi).

Giriş : mark.json (traced kontur + dairə mərkəzləri), mark-texture.png (orijinal artwork)
Çıxış : public/models/strativu-mark.glb

Model:
  • Gövdə  — traced siluet, qalınlaşdırılmış + faskalı. Ön/arxa üz orijinal artwork
              teksturası ilə (qara xətlər, içəri dağ, gradient — hamısı olduğu kimi),
              yan üzlər isə brend gradientində düz rəng.
  • Düyünlər — 3 kürə (loqodakı üç dairənin yerində), parlaq cyan.
Ölçü: ən böyük tərəf 2 Blender vahidi, mərkəz orijində.

İşə salma:
  blender --background --factory-startup --python build_mark.py
"""
import json
import os
import sys

import bpy
import bmesh
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(HERE, "mark.json")
TEXTURE = r"C:\Users\User\Downloads\strativu-site\strativu\public\brand\mark-texture.png"
OUT_DIR = r"C:\Users\User\Downloads\strativu-site\strativu\public\models"
OUT_GLB = os.path.join(OUT_DIR, "strativu-mark.glb")

DEPTH = 0.13          # gövdə qalınlığı (son ölçüdə, vahid)
BEVEL = 0.018         # kənar faskası
TARGET = 2.0          # ən böyük ölçü

data = json.load(open(JSON_PATH, encoding="utf-8"))
W, H = data["size"]
body = data["body"]
circles = data["circles"]

# ── səhnəni təmizlə ──────────────────────────────────────────────────────────
bpy.ops.wm.read_factory_settings(use_empty=True)

# ── piksel → yerli koordinat (mərkəzlənmiş, Y yuxarı, Z dərinlik) ────────────
scale = TARGET / max(W, H)


def px_to_local(x, y):
    return ((x - W / 2) * scale, -(y - H / 2) * scale)


# ── gövdə: poly curve → extrude + bevel → mesh ───────────────────────────────
curve = bpy.data.curves.new("MarkBody", type="CURVE")
curve.dimensions = "2D"
curve.fill_mode = "BOTH"
curve.resolution_u = 6
curve.extrude = DEPTH / 2
curve.bevel_depth = BEVEL
curve.bevel_resolution = 3
curve.offset = -BEVEL  # faska konturu BÖYÜTMƏSİN: kənar artwork-un içində qalsın

spline = curve.splines.new("POLY")
spline.points.add(len(body) - 1)
for i, (x, y) in enumerate(body):
    lx, ly = px_to_local(x, y)
    spline.points[i].co = (lx, ly, 0.0, 1.0)
spline.use_cyclic_u = True

body_obj = bpy.data.objects.new("StrativuMark", curve)
bpy.context.collection.objects.link(body_obj)

# curve → mesh
bpy.context.view_layer.objects.active = body_obj
body_obj.select_set(True)
bpy.ops.object.convert(target="MESH")
body_obj = bpy.context.active_object
body_obj.name = "StrativuMark"

mesh = body_obj.data
print("body verts", len(mesh.vertices), "polys", len(mesh.polygons))

# ── UV: öndən proyeksiya, teksturaya birbaşa uyğun ───────────────────────────
# Əyri→mesh çevrilməsi öz UV qatını yaradır; onu silirik ki, TEXCOORD_0 bizimki olsun.
while mesh.uv_layers:
    mesh.uv_layers.remove(mesh.uv_layers[0])
uv_layer = mesh.uv_layers.new(name="UVMap")
for poly in mesh.polygons:
    for loop_index in poly.loop_indices:
        v = mesh.vertices[mesh.loops[loop_index].vertex_index].co
        u = (v.x / scale + W / 2) / W
        w = 1.0 - (-v.y / scale + H / 2) / H
        uv_layer.data[loop_index].uv = (u, w)

_us = [uv_layer.data[i].uv[0] for i in range(len(mesh.loops))]
_vs = [uv_layer.data[i].uv[1] for i in range(len(mesh.loops))]
print("UV check u", round(min(_us), 3), round(max(_us), 3), "v", round(min(_vs), 3), round(max(_vs), 3))
print("vert y range", round(min(v.co.y for v in mesh.vertices), 3), round(max(v.co.y for v in mesh.vertices), 3))
print("vert x range", round(min(v.co.x for v in mesh.vertices), 3), round(max(v.co.x for v in mesh.vertices), 3))

# ── materiallar: 0 = artwork (ön/arxa), 1 = yan üzlər ────────────────────────
art = bpy.data.materials.new("MarkArtwork")
art.use_nodes = True
nodes = art.node_tree.nodes
links = art.node_tree.links
bsdf = nodes["Principled BSDF"]
tex_node = nodes.new("ShaderNodeTexImage")
tex_node.image = bpy.data.images.load(TEXTURE)
tex_node.interpolation = "Cubic"
links.new(tex_node.outputs["Color"], bsdf.inputs["Base Color"])
bsdf.inputs["Metallic"].default_value = 0.35
bsdf.inputs["Roughness"].default_value = 0.26
if "Emission Color" in bsdf.inputs:
    links.new(tex_node.outputs["Color"], bsdf.inputs["Emission Color"])
    bsdf.inputs["Emission Strength"].default_value = 0.12

side = bpy.data.materials.new("MarkSide")
side.use_nodes = True
sb = side.node_tree.nodes["Principled BSDF"]
sb.inputs["Base Color"].default_value = (0.055, 0.28, 0.86, 1.0)  # brend mavisi
sb.inputs["Metallic"].default_value = 0.75
sb.inputs["Roughness"].default_value = 0.3

mesh.materials.append(art)
mesh.materials.append(side)

# Artwork yalnız TAM DÜZ ön/arxa üzə verilir. Faska üzləri yan materialı alır —
# əks halda onlar teksturanın kənarındakı qara fondan nümunə götürüb qara haşiyə yaradır.
for poly in mesh.polygons:
    poly.material_index = 0 if abs(poly.normal.z) > 0.985 else 1

# ── hamar kölgələmə: yalnız faska üçün ───────────────────────────────────────
for poly in mesh.polygons:
    poly.use_smooth = abs(poly.normal.z) < 0.9

# ── düyünlər: üç kürə ────────────────────────────────────────────────────────
node_mat = bpy.data.materials.new("MarkNode")
node_mat.use_nodes = True
nb = node_mat.node_tree.nodes["Principled BSDF"]
nb.inputs["Base Color"].default_value = (0.42, 0.87, 1.0, 1.0)
nb.inputs["Metallic"].default_value = 0.35
nb.inputs["Roughness"].default_value = 0.16
if "Emission Color" in nb.inputs:
    nb.inputs["Emission Color"].default_value = (0.20, 0.68, 1.0, 1.0)
    nb.inputs["Emission Strength"].default_value = 0.35

node_objs = []
for i, c in enumerate(circles):
    lx, ly = px_to_local(c["cx"], c["cy"])
    r = c["r"] * scale * 1.02
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=32, ring_count=20, location=(lx, ly, DEPTH * 0.35))
    sphere = bpy.context.active_object
    sphere.name = f"MarkNode{i + 1}"
    sphere.data.materials.append(node_mat)
    bpy.ops.object.shade_smooth()
    node_objs.append(sphere)

# ── hamısını birləşdir və mərkəzə otur ───────────────────────────────────────
bpy.ops.object.select_all(action="DESELECT")
for o in [body_obj] + node_objs:
    o.select_set(True)
bpy.context.view_layer.objects.active = body_obj
bpy.ops.object.join()
mark = bpy.context.active_object
mark.name = "StrativuMark"

bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
mark.location = (0, 0, 0)

# glTF "Y-up" çevrilməsi (x, y, z) → (x, z, -y) edir: modeli əvvəlcədən X oxu ətrafında
# 90° çeviririk ki, ixracdan sonra loqo dik dursun və üzü +Z-ə baxsın.
import math

mark.rotation_euler = (math.radians(90), 0, 0)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)

dims = mark.dimensions
print("dimensions", tuple(round(d, 3) for d in dims))
print("final verts", len(mark.data.vertices), "tris(approx)", len(mark.data.polygons))

# ── export ───────────────────────────────────────────────────────────────────
os.makedirs(OUT_DIR, exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=OUT_GLB,
    export_format="GLB",
    use_selection=False,
    export_apply=True,
    export_yup=True,
    export_texture_dir="",
    export_image_format="AUTO",
    export_materials="EXPORT",
    export_normals=True,
)
print("EXPORTED", OUT_GLB, os.path.getsize(OUT_GLB), "bytes")
