import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'r') as f:
    content = f.read()

replacement = """          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              maxzoom: 19,
              attribution: '© OpenStreetMap contributors',
            },
            'google-satellite': {
              type: 'raster',
              tiles: ['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'],
              tileSize: 256,
              maxzoom: 21,"""

content = re.sub(
    r"          sources: \{\n            osm: \{\n              type: 'raster',\n              tiles: \['https:\/\/a\.tile\.openstreetmap\.org\/\{z\}\/\{x\}\/\{y\}\.png'\],\n              tileSize: 256,\n              attribution: '© OpenStreetMap contributors',\n            \},\n            'google-satellite': \{\n              type: 'raster',\n              tiles: \['https:\/\/mt1\.google\.com\/vt\/lyrs=s&x=\{x\}&y=\{y\}&z=\{z\}'\],\n              tileSize: 256,",
    replacement,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'w') as f:
    f.write(content)
