import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'r') as f:
    content = f.read()

# Fix initialization of fill layer
content = content.replace(
    "'fill-outline-color': layerName === 'nops' ? '#000000' : config.color,",
    "'fill-outline-color': config.color,"
)

# Fix initialization of line layer
content = content.replace(
    "'line-color': layerName === 'nops' ? '#000000' : config.color,",
    "'line-color': config.color,"
)

# Fix dynamic update
replacement = """
        try {
          if (map.getLayer(fillLayerId)) {
            map.setPaintProperty(fillLayerId, "fill-color", style.fillColor);
            map.setPaintProperty(fillLayerId, "fill-opacity", style.fillOpacity / 100);
            map.setPaintProperty(fillLayerId, "fill-outline-color", style.outlineColor);
          }
          
          if (map.getLayer(lineLayerId)) {
            map.setPaintProperty(lineLayerId, "line-color", style.outlineColor);
          }
        } catch (err) {}
"""

content = re.sub(r"        try \{\n          if \(map\.getLayer\(fillLayerId\)\) \{.*?        \} catch \(err\) \{\}", replacement.strip(), content, flags=re.DOTALL)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'w') as f:
    f.write(content)
