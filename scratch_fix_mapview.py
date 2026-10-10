import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'r') as f:
    content = f.read()

# Add line-opacity to dynamic style loop
replacement = """
          if (map.getLayer(lineLayerId)) {
            map.setPaintProperty(lineLayerId, "line-color", style.outlineColor);
            map.setPaintProperty(lineLayerId, "line-opacity", style.outlineOpacity / 100);
          }
"""

content = re.sub(
    r"          if \(map\.getLayer\(lineLayerId\)\) \{\n            map\.setPaintProperty\(lineLayerId, \"line-color\", style\.outlineColor\);\n          \}",
    replacement.strip('\n'),
    content
)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'w') as f:
    f.write(content)
