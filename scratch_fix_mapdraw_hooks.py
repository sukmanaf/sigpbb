import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

content = content.replace("  if (!canEdit) return null;\n", "")
content = content.replace("  return (\n    <>\n      {editingPolygonInfo", "  if (!canEdit) return null;\n\n  return (\n    <>\n      {editingPolygonInfo")

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)
