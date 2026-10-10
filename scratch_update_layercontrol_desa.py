import re

with open('/home/wgipro/koding/newmap/my-app/components/map/LayerControl.tsx', 'r') as f:
    content = f.read()

# I need to add ctx.setSelectedDesa(null) and ctx.setSelectedDesaName(null)
# But wait, ctx is destructured as:
# const { map, layers, setLayers, selectedDesa, layerStyles, setLayerStyles } = ctx;
# It doesn't destructure setSelectedDesa! Let's just use ctx.setSelectedDesa.

replacement = """    // If turning ON the Desa layer, auto-hide the detailed layers, reset Tematik, and zoom out
    if (layerKey === 'desas' && newLayers.desas === true) {
       newLayers.nops = false;
       newLayers.bloks = false;
       newLayers.bangunans = false;
       
       if (ctx.activeTematik) {
          ctx.setActiveTematik(null);
       }
       
       // Clear selected desa so they are FORCED to pick a new one
       ctx.setSelectedDesa(null);
       ctx.setSelectedDesaName(null);
       
       // Zoom back to Pasuruan global view
       if (map) {
          map.fitBounds([
            [112.871, -7.669],
            [112.924, -7.625]
          ], { padding: 50, duration: 1500 });
       }
    }"""

content = re.sub(
    r"    // If turning ON the Desa layer, auto-hide the detailed layers, reset Tematik, and zoom out\n    if \(layerKey === 'desas' && newLayers\.desas === true\) \{\n       newLayers\.nops = false;\n       newLayers\.bloks = false;\n       newLayers\.bangunans = false;\n       \n       if \(ctx\.activeTematik\) \{\n          ctx\.setActiveTematik\(null\);\n       \}\n       \n       // Zoom back to Pasuruan global view\n       if \(map\) \{\n          map\.fitBounds\(\[\n            \[112\.871, -7\.669\],\n            \[112\.924, -7\.625\]\n          \], \{ padding: 50, duration: 1500 \}\);\n       \}\n    \}",
    replacement,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/components/map/LayerControl.tsx', 'w') as f:
    f.write(content)
