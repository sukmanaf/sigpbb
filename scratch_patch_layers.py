import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

old_fetch = """                  const res = await fetch('/api/polygons/by-area', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ geometry, desaKode: ctx.selectedDesa })
                  });"""

new_fetch = """                  const res = await fetch('/api/polygons/by-area', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ geometry, desaKode: ctx.selectedDesa, layers: ctx.layers })
                  });"""

content = content.replace(old_fetch, new_fetch)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)
