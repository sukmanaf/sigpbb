import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'r') as f:
    content = f.read()

replacement = """      // Layer state: hide desas, show nops
      const newLayers = { ...ctx.layers, desas: false, nops: true };
      ctx.setLayers(newLayers);
      
      // Reset Tematik state when a new Desa is selected
      if (ctx.activeTematik) {
         ctx.setActiveTematik(null);
      }"""

content = content.replace("""      // Layer state: hide desas, show nops
      const newLayers = { ...ctx.layers, desas: false, nops: true };
      ctx.setLayers(newLayers);""", replacement)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'w') as f:
    f.write(content)
