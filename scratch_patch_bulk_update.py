import re

with open('/home/wgipro/koding/newmap/my-app/app/api/polygons/bulk-update/route.ts', 'r') as f:
    content = f.read()

old_code = """                let table = 'nops';
                if (type === 'blok') table = 'bloks';
                if (type === 'bangunan') table = 'bangunans';"""

new_code = """                let table = 'nops';
                if (type === 'blok') table = 'bloks';
                if (type === 'bangunan') table = 'bangunans';
                if (type === 'desa') table = 'desas';"""

content = content.replace(old_code, new_code)

# We also need to extract real ID if the frontend passed type_id as feature.id
# In MapDrawCtrl bulk update, we did: feature.id = `${row.type}_${row.id}`
# Wait, let's fix the id parsing!
id_parse_old = """                const id = feature.id || feature.properties?.id;
                const type = feature.properties?.type || 'nop'; // assume nop if undefined"""

id_parse_new = """                const type = feature.properties?.type || 'nop'; // assume nop if undefined
                // Extract real ID if feature.id is a string like "nop_123"
                let rawId = feature.id || feature.properties?.id;
                let id = typeof rawId === 'string' && rawId.includes('_') ? rawId.split('_')[1] : rawId;"""

content = content.replace(id_parse_old, id_parse_new)

with open('/home/wgipro/koding/newmap/my-app/app/api/polygons/bulk-update/route.ts', 'w') as f:
    f.write(content)
