import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

bad_chunk = """  // 2. Listen for the custom event to toggle edit mode
  useEffect(() => {
    if (!canEdit) return;
    const handleToggle = () => ctx?.setMode(ctx.mode === 'edit' ? 'view' : 'edit');
    const handleToggleFast = () => ctx?.setMode(ctx.mode === 'fast-edit' ? 'view' : 'fast-edit');
    window.addEventListener('toggleEditMode', handleToggle);
    window.addEventListener('toggleFastEditMode', handleToggleFast);
    const handleBulkSave = async () => {
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

  return () => {
       window.removeEventListener('toggleEditMode', handleToggle);
       window.removeEventListener('toggleFastEditMode', handleToggleFast);
    };
  }, [ctx]);"""

good_chunk = """  // 2. Listen for the custom event to toggle edit mode
  useEffect(() => {
    if (!canEdit) return;
    const handleToggle = () => ctx?.setMode(ctx.mode === 'edit' ? 'view' : 'edit');
    const handleToggleFast = () => ctx?.setMode(ctx.mode === 'fast-edit' ? 'view' : 'fast-edit');
    const handleToggleBulk = () => {
      if (ctx?.mode === 'bulk-edit') {
        ctx.setMode('view');
        drawControlRef.current?.deleteAll();
        setShowBulkSaveBtn(false);
      } else {
        ctx?.setMode('bulk-edit');
        drawControlRef.current?.changeMode('draw_polygon');
        Swal.fire({
          title: 'Geser Massal',
          text: 'Buat kotak (polygon) yang mencakup semua NOP yang ingin digeser bersamaan.',
          icon: 'info'
        });
      }
    };

    window.addEventListener('toggleEditMode', handleToggle);
    window.addEventListener('toggleFastEditMode', handleToggleFast);
    window.addEventListener('toggleBulkEditMode', handleToggleBulk);

    return () => {
       window.removeEventListener('toggleEditMode', handleToggle);
       window.removeEventListener('toggleFastEditMode', handleToggleFast);
       window.removeEventListener('toggleBulkEditMode', handleToggleBulk);
    };
  }, [ctx]);"""

content = content.replace(bad_chunk, good_chunk)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)
