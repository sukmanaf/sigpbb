import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'map.setPaintProperty(lineLayerId, "line-opacity", style.outlineOpacity / 100);',
    'map.setPaintProperty(lineLayerId, "line-opacity", (style.outlineOpacity ?? 80) / 100);'
)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'w') as f:
    f.write(content)
