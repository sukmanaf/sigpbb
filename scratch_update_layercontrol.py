import re

with open('/home/wgipro/koding/newmap/my-app/components/map/LayerControl.tsx', 'r') as f:
    content = f.read()

replacement = """  const toggleLayer = (layerKey: keyof LayerState) => {
    if (!map) return;

    if (DESA_DEPENDENT.includes(layerKey) && !selectedDesa && !layers[layerKey]) {
      Swal.fire('Perhatian!', 'Pilih desa terlebih dahulu dengan mengklik polygon desa di peta', 'warning');
      return;
    }

    const newLayers = { ...layers };
    newLayers[layerKey] = !newLayers[layerKey];
    
    // If turning ON the Desa layer, auto-hide the detailed layers and reset Tematik
    if (layerKey === 'desas' && newLayers.desas === true) {
       newLayers.nops = false;
       newLayers.bloks = false;
       newLayers.bangunans = false;
       
       if (ctx.activeTematik) {
          ctx.setActiveTematik(null);
       }
    }
    
    setLayers(newLayers);
  };"""

content = re.sub(
    r"  const toggleLayer = \(layerKey: keyof LayerState\) => \{.*?    setLayers\(newLayers\);\n  \};",
    replacement,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/components/map/LayerControl.tsx', 'w') as f:
    f.write(content)
