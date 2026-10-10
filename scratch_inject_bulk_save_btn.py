import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

# Add handleBulkSave function before return
bulk_save_logic = """  const handleBulkSave = async () => {
       if (!drawControlRef.current) return;
       const allFeatures = drawControlRef.current.getAll();
       const featuresToSave = allFeatures.features;
       
       if (featuresToSave.length === 0) return;
       
       Swal.fire({title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading()});
       try {
           const res = await fetch('/api/polygons/bulk-update', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ features: featuresToSave })
           });
           
           if (res.ok) {
               drawControlRef.current.deleteAll();
               setShowBulkSaveBtn(false);
               ctx?.setMode('view');
               
               // Force map source refresh
               const map = ctx?.map;
               if (map) {
                   const layer = 'nops';
                   const source = map.getSource(layer);
                   if (source?.setTiles) {
                       source.setTiles([`/api/tiles/${layer}/{z}/{x}/{y}?desa=${ctx.selectedDesa}&t=${Date.now()}`]);
                       if ((source as any).clearTiles) (source as any).clearTiles();
                   }
               }
               Swal.fire('Sukses', 'Pergeseran massal berhasil disimpan!', 'success');
           } else {
               throw new Error('Gagal update');
           }
       } catch (err) {
           Swal.fire('Error', 'Gagal menyimpan', 'error');
       }
  };

  return ("""

content = content.replace("  return (", bulk_save_logic)

# Add the UI button
ui_button = """      {/* Fast Edit Save Button */}
      {showBulkSaveBtn && ctx?.mode === 'bulk-edit' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex gap-2">
           <button
             onClick={handleBulkSave}
             className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
             Simpan Pergeseran Massal
           </button>
           <button
             onClick={() => {
                drawControlRef.current?.deleteAll();
                setShowBulkSaveBtn(false);
                ctx?.setMode('view');
             }}
             className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
           >
             Batal
           </button>
        </div>
      )}

      {/* Save Polygon Modal (For Create) */}"""

content = content.replace("      {/* Save Polygon Modal (For Create) */}", ui_button)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)
