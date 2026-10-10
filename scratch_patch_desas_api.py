import re

with open('/home/wgipro/koding/newmap/my-app/app/api/desas/route.ts', 'r') as f:
    content = f.read()

old_query = """        SELECT d_kd_kel, d_nm_kel, geom 
        FROM desas"""

new_query = """        SELECT id, d_kd_kel, d_nm_kel, geom 
        FROM desas"""

content = content.replace(old_query, new_query)

with open('/home/wgipro/koding/newmap/my-app/app/api/desas/route.ts', 'w') as f:
    f.write(content)
