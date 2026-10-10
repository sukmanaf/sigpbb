import re

with open('/home/wgipro/koding/newmap/my-app/components/map/LayerControl.tsx', 'r') as f:
    content = f.read()

replacement = """    // If turning ON the Desa layer, auto-hide the detailed layers, reset Tematik, and zoom out
    if (layerKey === 'desas' && newLayers.desas === true) {
       newLayers.nops = false;
       newLayers.bloks = false;
       newLayers.bangunans = false;
       
       if (ctx.activeTematik) {
          ctx.setActiveTematik(null);
       }
       
       // Zoom back to Pasuruan global view
       if (map) {
          map.fitBounds([
            [112.871, -7.669],
            [112.924, -7.625]
          ], { padding: 50, duration: 1500 });
       }
    }"""

content = re.sub(
    r"    // If turning ON the Desa layer, auto-hide the detailed layers and reset Tematik\n    if \(layerKey === 'desas' && newLayers\.desas === true\) \{\n       newLayers\.nops = false;\n       newLayers\.bloks = false;\n       newLayers\.bangunans = false;\n       \n       if \(ctx\.activeTematik\) \{\n          ctx\.setActiveTematik\(null\);\n       \}\n    \}",
    replacement,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/components/map/LayerControl.tsx', 'w') as f:
    f.write(content)
