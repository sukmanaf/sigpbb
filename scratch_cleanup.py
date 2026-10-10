import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'r') as f:
    content = f.read()

# Define the exact block string that we want to remove
block_regex = r"  // Update layer styles dynamically based on MapContext.*?  }, \[ctx\?\.layerStyles, ctx\?\.layers, mapLoaded\]\);\n\n"

# Remove all occurrences
cleaned = re.sub(block_regex, "", content, flags=re.DOTALL)

# Now, find the LAST `  return (` and insert the block exactly once before it.
block = """
  // Update layer styles dynamically based on MapContext
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !ctx) return;
    const map = mapRef.current;
    
    if (ctx.layerStyles) {
      Object.entries(ctx.layerStyles).forEach(([layerKey, style]) => {
        const fillLayerId = `${layerKey}-fill`;
        const lineLayerId = `${layerKey}-line`;
        
        try {
          if (map.getLayer(fillLayerId)) {
            map.setPaintProperty(fillLayerId, "fill-color", style.color);
            map.setPaintProperty(fillLayerId, "fill-opacity", style.opacity / 100);
            if (layerKey !== "nops") {
              map.setPaintProperty(fillLayerId, "fill-outline-color", style.color);
            }
          }
          
          if (map.getLayer(lineLayerId)) {
            if (layerKey !== "nops") {
               map.setPaintProperty(lineLayerId, "line-color", style.color);
            }
          }
        } catch (err) {}
      });
    }

    if (ctx.layers) {
       Object.entries(ctx.layers).forEach(([layerKey, isVisible]) => {
          const visibility = isVisible ? "visible" : "none";
          const fillLayerId = `${layerKey}-fill`;
          const lineLayerId = `${layerKey}-line`;
          const labelLayerId = `${layerKey}-label`;
          
          if (map.getLayer(fillLayerId)) map.setLayoutProperty(fillLayerId, "visibility", visibility);
          if (map.getLayer(lineLayerId)) map.setLayoutProperty(lineLayerId, "visibility", visibility);
          if (map.getLayer(labelLayerId)) map.setLayoutProperty(labelLayerId, "visibility", visibility);
       });
    }
  }, [ctx?.layerStyles, ctx?.layers, mapLoaded]);

"""

last_return_idx = cleaned.rfind("  return (")
final_content = cleaned[:last_return_idx] + block + cleaned[last_return_idx:]

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'w') as f:
    f.write(final_content)

