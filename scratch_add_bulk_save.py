import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

# Add handleBulkSave right before the return statement of the component
bulk_save_func = """  const handleBulkSave = async () => {
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

if "const handleBulkSave =" not in content:
    content = content.replace("  return (", bulk_save_func)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)
