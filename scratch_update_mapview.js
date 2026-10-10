const fs = require('fs');
const file = '/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx';
let content = fs.readFileSync(file, 'utf8');

const updateEffect = `
  // Update layer styles dynamically
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !ctx?.layerStyles) return;
    const map = mapRef.current;
    
    Object.entries(ctx.layerStyles).forEach(([layerKey, style]) => {
      const fillLayerId = \`\${layerKey}-fill\`;
      const lineLayerId = \`\${layerKey}-line\`;
      
      try {
        if (map.getLayer(fillLayerId)) {
          map.setPaintProperty(fillLayerId, 'fill-color', style.color);
          map.setPaintProperty(fillLayerId, 'fill-opacity', style.opacity / 100);
          if (layerKey !== 'nops') {
            map.setPaintProperty(fillLayerId, 'fill-outline-color', style.color);
          }
        }
        
        if (map.getLayer(lineLayerId)) {
          if (layerKey !== 'nops') {
             map.setPaintProperty(lineLayerId, 'line-color', style.color);
          }
        }
      } catch (err) {
        // ignore if layer isn't fully ready
      }
    });
  }, [ctx?.layerStyles, mapLoaded]);
`;

content = content.replace('  // Handle Context Layer Visibility', updateEffect + '\n  // Handle Context Layer Visibility');
fs.writeFileSync(file, content);
const fs = require('fs');
const file = '/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx';
let content = fs.readFileSync(file, 'utf8');

const effect = `
  // Update layer styles dynamically based on MapContext
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !ctx) return;
    const map = mapRef.current;
    
    if (ctx.layerStyles) {
      Object.entries(ctx.layerStyles).forEach(([layerKey, style]) => {
        const fillLayerId = \`\${layerKey}-fill\`;
        const lineLayerId = \`\${layerKey}-line\`;
        
        try {
          if (map.getLayer(fillLayerId)) {
            map.setPaintProperty(fillLayerId, 'fill-color', style.color);
            map.setPaintProperty(fillLayerId, 'fill-opacity', style.opacity / 100);
            if (layerKey !== 'nops') {
              map.setPaintProperty(fillLayerId, 'fill-outline-color', style.color);
            }
          }
          
          if (map.getLayer(lineLayerId)) {
            if (layerKey !== 'nops') {
               map.setPaintProperty(lineLayerId, 'line-color', style.color);
            }
          }
        } catch (err) {}
      });
    }

    // Handle Layer Visibility dynamically
    if (ctx.layers) {
       Object.entries(ctx.layers).forEach(([layerKey, isVisible]) => {
          const visibility = isVisible ? 'visible' : 'none';
          const fillLayerId = \`\${layerKey}-fill\`;
          const lineLayerId = \`\${layerKey}-line\`;
          const labelLayerId = \`\${layerKey}-label\`;
          
          if (map.getLayer(fillLayerId)) map.setLayoutProperty(fillLayerId, 'visibility', visibility);
          if (map.getLayer(lineLayerId)) map.setLayoutProperty(lineLayerId, 'visibility', visibility);
          if (map.getLayer(labelLayerId)) map.setLayoutProperty(labelLayerId, 'visibility', visibility);
       });
    }
  }, [ctx?.layerStyles, ctx?.layers, mapLoaded]);
`;

// Insert before the last return
content = content.replace('  return (', effect + '\n  return (');
fs.writeFileSync(file, content);
