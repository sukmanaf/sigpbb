import re

with open('/home/wgipro/koding/newmap/my-app/app/api/polygons/by-area/route.ts', 'r') as f:
    content = f.read()

old_code = """        if (!layers || layers.nops !== false) activeTypes.push({ table: 'nops', codeCol: 'd_nop', typeStr: 'nop' });
        if (layers?.bloks) activeTypes.push({ table: 'bloks', codeCol: 'd_blok', typeStr: 'blok' });
        if (layers?.bangunans) activeTypes.push({ table: 'bangunans', codeCol: 'd_nop', typeStr: 'bangunan' });"""

new_code = """        if (!layers || layers.nops !== false) activeTypes.push({ table: 'nops', codeCol: 'd_nop', typeStr: 'nop' });
        if (layers?.bloks) activeTypes.push({ table: 'bloks', codeCol: 'd_blok', typeStr: 'blok' });
        if (layers?.bangunans) activeTypes.push({ table: 'bangunans', codeCol: 'd_nop', typeStr: 'bangunan' });
        if (layers?.desas) activeTypes.push({ table: 'desas', codeCol: 'd_kd_kel', typeStr: 'desa' });"""

content = content.replace(old_code, new_code)

with open('/home/wgipro/koding/newmap/my-app/app/api/polygons/by-area/route.ts', 'w') as f:
    f.write(content)
