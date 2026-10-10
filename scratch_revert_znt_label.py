import re

with open('/home/wgipro/koding/newmap/my-app/components/map/TematikController.tsx', 'r') as f:
    content = f.read()

old_logic = "const nir = `${item.KD_ZNT || '-'} : ${item.NIR || 'Tidak Diketahui'}`;"
new_logic = "const nir = item.NIR || 'Tidak Diketahui';"

content = content.replace(old_logic, new_logic)

with open('/home/wgipro/koding/newmap/my-app/components/map/TematikController.tsx', 'w') as f:
    f.write(content)
