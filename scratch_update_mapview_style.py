import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'r') as f:
    content = f.read()

replacement = """        try {
          if (map.getLayer(fillLayerId)) {
            // Jangan override warna NOP jika sedang mode Tematik
            if (!(layerKey === 'nops' && ctx.activeTematik)) {
               map.setPaintProperty(fillLayerId, "fill-color", style.fillColor);
               map.setPaintProperty(fillLayerId, "fill-opacity", (style.fillOpacity ?? 30) / 100);
            }
          }
          if (map.getLayer(lineLayerId)) {"""

content = re.sub(
    r'        try \{\n          if \(map\.getLayer\(fillLayerId\)\) \{\n            map\.setPaintProperty\(fillLayerId, "fill-color", style\.fillColor\);\n            map\.setPaintProperty\(fillLayerId, "fill-opacity", \(style\.fillOpacity \?\? 30\) / 100\);\n          \}\n          if \(map\.getLayer\(lineLayerId\)\) \{',
    replacement,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'w') as f:
    f.write(content)
