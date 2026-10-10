import re

with open('/home/wgipro/koding/newmap/my-app/app/api/polygon-update/route.ts', 'r') as f:
    content = f.read()

old_code = """        } else if (type === 'bangunan') {
            await pool.query(
                `UPDATE bangunans SET d_nop = $1, geom = ST_GeomFromText($2, 4326), updated_at = NOW() WHERE id = $3`,
                [code, wkt, id]
            );
        }"""

new_code = """        } else if (type === 'bangunan') {
            await pool.query(
                `UPDATE bangunans SET d_nop = $1, geom = ST_GeomFromText($2, 4326), updated_at = NOW() WHERE id = $3`,
                [code, wkt, id]
            );
        } else if (type === 'desa') {
            await pool.query(
                `UPDATE desas SET d_kd_kel = $1, geom = ST_GeomFromText($2, 4326), updated_at = NOW() WHERE id = $3`,
                [code, wkt, id]
            );
        }"""

content = content.replace(old_code, new_code)

with open('/home/wgipro/koding/newmap/my-app/app/api/polygon-update/route.ts', 'w') as f:
    f.write(content)
