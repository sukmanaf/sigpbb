import re

with open('/home/wgipro/koding/newmap/my-app/types/map.ts', 'r') as f:
    content = f.read()

content = content.replace(
    '  outlineColor: string;\n}', 
    '  outlineColor: string;\n  outlineOpacity: number;\n}'
)

with open('/home/wgipro/koding/newmap/my-app/types/map.ts', 'w') as f:
    f.write(content)

with open('/home/wgipro/koding/newmap/my-app/components/providers/MapProvider.tsx', 'r') as f:
    content = f.read()

content = content.replace("outlineColor: '#10b981' }", "outlineColor: '#10b981', outlineOpacity: 100 }")
content = content.replace("outlineColor: '#f97316' }", "outlineColor: '#f97316', outlineOpacity: 80 }")
content = content.replace("outlineColor: '#16a34a' }", "outlineColor: '#16a34a', outlineOpacity: 80 }")
content = content.replace("outlineColor: '#7c3aed' }", "outlineColor: '#7c3aed', outlineOpacity: 80 }")

with open('/home/wgipro/koding/newmap/my-app/components/providers/MapProvider.tsx', 'w') as f:
    f.write(content)
