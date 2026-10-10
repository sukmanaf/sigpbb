import re

with open('/home/wgipro/koding/newmap/my-app/components/map/LayerControl.tsx', 'r') as f:
    content = f.read()

replacement = """       // Zoom back to Pasuruan global view (sama dengan center dan zoom awal halaman dibuka)
       if (map) {
          map.flyTo({
            center: [112.935, -7.64],
            zoom: 12.5,
            duration: 1500
          });
       }"""

content = re.sub(
    r"       // Zoom back to Pasuruan global view\n       if \(map\) \{\n          map\.fitBounds\(\[\n            \[112\.871, -7\.669\],\n            \[112\.924, -7\.625\]\n          \], \{ padding: 50, duration: 1500 \}\);\n       \}",
    replacement,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/components/map/LayerControl.tsx', 'w') as f:
    f.write(content)
