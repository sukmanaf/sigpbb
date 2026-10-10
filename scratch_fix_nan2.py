import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'map.setPaintProperty(fillLayerId, "fill-opacity", style.fillOpacity / 100);',
    'map.setPaintProperty(fillLayerId, "fill-opacity", (style.fillOpacity ?? 30) / 100);'
)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'w') as f:
    f.write(content)
