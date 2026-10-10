import re

with open('/home/wgipro/koding/newmap/my-app/lib/mvt.ts', 'r') as f:
    content = f.read()

# Replace bloks query
content = re.sub(
    r"  bloks: `bloks b\n    JOIN desas d ON ST_Intersects\(d.geom, b.geom\)\n    WHERE b.geom && ST_Transform\(ST_TileEnvelope\(\$1,\$2,\$3\), 4326\)\n      AND d.d_kd_kel = \$4`,",
    r"  bloks: `bloks b\n    WHERE b.geom && ST_Transform(ST_TileEnvelope($1,$2,$3), 4326)\n      AND left(b.d_blok, 10) = $4`,",
    content
)

# Replace bangunans query
content = re.sub(
    r"  bangunans: `bangunans bu\n    JOIN desas d ON ST_Intersects\(d.geom, bu.geom\)\n    WHERE bu.geom && ST_Transform\(ST_TileEnvelope\(\$1,\$2,\$3\), 4326\)\n      AND d.d_kd_kel = \$4`,",
    r"  bangunans: `bangunans bu\n    WHERE bu.geom && ST_Transform(ST_TileEnvelope($1,$2,$3), 4326)\n      AND left(bu.d_nop, 10) = $4`,",
    content
)

with open('/home/wgipro/koding/newmap/my-app/lib/mvt.ts', 'w') as f:
    f.write(content)
