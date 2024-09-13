import bpy

# Cargar archivo FBX
bpy.ops.import_scene.fbx(filepath='castelia_city.fbx')

# Iterar sobre todos los materiales
for material in bpy.data.materials:
    if material.node_tree:
        for node in material.node_tree.nodes:
            if node.type == 'TEX_IMAGE':
                print(node.image.filepath)

