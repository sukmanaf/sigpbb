import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

# 1. Add state for bulk save button
if 'const [showBulkSaveBtn, setShowBulkSaveBtn] = useState(false);' not in content:
    content = content.replace(
        "const [editModalOpen, setEditModalOpen] = useState(false);",
        "const [editModalOpen, setEditModalOpen] = useState(false);\n  const [showBulkSaveBtn, setShowBulkSaveBtn] = useState(false);"
    )

# 2. Add bulk edit button
old_fast_edit_btn = """            fastEditBtn.onclick = () => window.dispatchEvent(new CustomEvent('toggleFastEditMode'));
            targetGroup.appendChild(fastEditBtn);"""

new_fast_edit_btn = """            fastEditBtn.onclick = () => window.dispatchEvent(new CustomEvent('toggleFastEditMode'));
            targetGroup.appendChild(fastEditBtn);

            // 3. Bulk Edit Button (Area Select)
            const bulkEditBtn = document.createElement('button');
            bulkEditBtn.className = 'mapbox-gl-draw_ctrl-draw-btn custom-bulk-edit-toggle-btn';
            bulkEditBtn.title = 'Geser Massal (Pilih Area)';
            bulkEditBtn.style.color = '#333333';
            bulkEditBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin:6px auto;display:block;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M9 3v18"/><path d="M15 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>`;
            bulkEditBtn.onclick = () => window.dispatchEvent(new CustomEvent('toggleBulkEditMode'));
            targetGroup.appendChild(bulkEditBtn);"""

content = content.replace(old_fast_edit_btn, new_fast_edit_btn)

# 3. Handle active styles for bulk-edit
old_active_style = """            } else if (ctx?.mode === 'fast-edit') {
              fastEditBtn.classList.add('active'); 
            }"""

new_active_style = """            } else if (ctx?.mode === 'fast-edit') {
              fastEditBtn.classList.add('active'); 
            } else if (ctx?.mode === 'bulk-edit') {
              bulkEditBtn.classList.add('active');
            }"""
            
content = content.replace(old_active_style, new_active_style)

# 4. Handle create logic for bulk edit
old_handle_create = """        const handleCreate = (e: any) => {
          const feature = e.features[0];
          const coords = feature.geometry.coordinates[0];
          setDrawnCoordinates(coords);
          setModalOpen(true);
        };"""

new_handle_create = """        const handleCreate = async (e: any) => {
          const feature = e.features[0];
          
          if (ctx.mode === 'bulk-edit') {
              // The user just drew the lasso area!
              const geometry = feature.geometry;
              
              // 1. Remove the lasso polygon
              drawControlRef.current.delete(feature.id);
              
              // 2. Fetch all polygons intersecting this area
              Swal.fire({title: 'Memindai area...', allowOutsideClick: false, didOpen: () => Swal.showLoading()});
              try {
                  const res = await fetch('/api/polygons/by-area', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ geometry, desaKode: ctx.selectedDesa })
                  });
                  const data = await res.json();
                  if (data.features && data.features.length > 0) {
                      // 3. Load them into MapboxDraw
                      drawControlRef.current.add({ type: 'FeatureCollection', features: data.features });
                      
                      // 4. Select all of them
                      const ids = data.features.map((f: any) => f.id);
                      drawControlRef.current.changeMode('simple_select', { featureIds: ids });
                      
                      // Show Bulk Save button
                      setShowBulkSaveBtn(true);
                      
                      Swal.fire('Terpilih!', `${ids.length} NOP berhasil ditangkap. Silakan geser salah satunya (tahan dan geser), semuanya akan ikut bergeser!`, 'success');
                  } else {
                      Swal.fire('Kosong', 'Tidak ada NOP di area tersebut', 'info');
                  }
              } catch (err) {
                  Swal.fire('Error', 'Gagal memindai area', 'error');
              }
              return;
          }

          const coords = feature.geometry.coordinates[0];
          setDrawnCoordinates(coords);
          setModalOpen(true);
        };"""

content = content.replace(old_handle_create, new_handle_create)

# 5. Handle toggle bulk event
old_toggle_events = """  useEffect(() => {
    const handleToggleEdit = () => {"""

new_toggle_events = """  useEffect(() => {
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
    window.addEventListener('toggleBulkEditMode', handleToggleBulk);
    return () => window.removeEventListener('toggleBulkEditMode', handleToggleBulk);
  }, [ctx]);

  useEffect(() => {
    const handleToggleEdit = () => {"""

content = content.replace(old_toggle_events, new_toggle_events)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)
