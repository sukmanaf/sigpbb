import re

with open('/home/wgipro/koding/newmap/my-app/app/api/polygons/by-area/route.ts', 'r') as f:
    content = f.read()

old_query = """        const res = await pool.query(
            `SELECT id, d_nop as code, ST_AsGeoJSON(geom) as geometry 
             FROM nops 
             WHERE d_kd_kel = $1 AND ST_Intersects(geom, ST_SetSRID(ST_GeomFromGeoJSON($2), 4326))`,
            [desaKode, JSON.stringify(geometry)]
        );"""

new_query = """        console.log('Querying area for desa:', desaKode);
        console.log('Geometry:', JSON.stringify(geometry));
        const res = await pool.query(
            `SELECT id, d_nop as code, ST_AsGeoJSON(geom) as geometry 
             FROM nops 
             WHERE d_kd_kel = $1 AND ST_Intersects(geom, ST_SetSRID(ST_GeomFromGeoJSON($2), 4326))`,
            [desaKode, JSON.stringify(geometry)]
        );
        console.log('Found rows:', res.rowCount);"""

content = content.replace(old_query, new_query)

with open('/home/wgipro/koding/newmap/my-app/app/api/polygons/by-area/route.ts', 'w') as f:
    f.write(content)
