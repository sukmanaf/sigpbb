import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

injection = """      {/* Clear Desa Button */}
      {ctx?.selectedDesa && (
        <div className="absolute top-[200px] right-2 z-[999]">
          <button 
             title="Tutup Desa (Kembali ke Tampilan Kota)"
             className="bg-white p-[9px] rounded shadow hover:bg-gray-50 flex items-center justify-center text-red-500 border border-gray-200"
             onClick={() => {
                ctx.setLayers({ desas: true, nops: false, bloks: false, bangunans: false });
                ctx.setSelectedDesa(null);
                ctx.setSelectedDesaName(null);
                if ((ctx as any).setActiveTematik) (ctx as any).setActiveTematik(null);
                
                const map = ctx.map;
                if (map) {
                  // Hide dependent layers
                  ['nops-fill', 'nops-line', 'nops-label', 'bloks-fill', 'bloks-line', 'bloks-label', 'bangunans-fill', 'bangunans-line', 'bangunans-label'].forEach((id) => {
                     if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none');
                  });
                  // Show desas
                  ['desas-fill', 'desas-line', 'desas-label'].forEach((id) => {
                     if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'visible');
                  });
                  
                  // Fly to Pasuruan city
                  map.flyTo({ center: [112.90, -7.64], zoom: 12.5, duration: 1500 });
                }
             }}
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      )}"""

# Replace `<>` right after `return (` with `<>\n{injection}`
content = content.replace("  return (\n    <>\n", "  return (\n    <>\n" + injection + "\n")

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)
