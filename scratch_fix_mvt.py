import re

with open('/home/wgipro/koding/newmap/my-app/lib/mvt.ts', 'r') as f:
    content = f.read()

content = content.replace('''  bangunans: `bangunans bu
    WHERE bu.geom && ST_Transform(ST_TileEnvelope($1,$2,$3), 4326)
      AND left(bu.d_nop, 10) = $4`''', 
      '''  bangunans: `bangunans bu
    JOIN desas d ON ST_Intersects(d.geom, bu.geom)
    WHERE bu.geom && ST_Transform(ST_TileEnvelope($1,$2,$3), 4326)
      AND d.d_kd_kel = $4`''')

with open('/home/wgipro/koding/newmap/my-app/lib/mvt.ts', 'w') as f:
    f.write(content)
