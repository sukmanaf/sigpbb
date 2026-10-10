import re

with open('/home/wgipro/koding/newmap/my-app/app/api/polygons/by-area/route.ts', 'r') as f:
    content = f.read()

old_query = "ST_Intersects(geom, ST_SetSRID(ST_GeomFromGeoJSON($2), 4326))"
new_query = "ST_Intersects(ST_SetSRID(geom, 4326), ST_SetSRID(ST_GeomFromGeoJSON($2), 4326))"

content = content.replace(old_query, new_query)

with open('/home/wgipro/koding/newmap/my-app/app/api/polygons/by-area/route.ts', 'w') as f:
    f.write(content)
