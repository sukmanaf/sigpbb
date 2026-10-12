'use client';

import { useEffect, useRef, useContext, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MapContext } from '@/components/providers/MapProvider';
import maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { SavePolygonModal } from './SavePolygonModal';
import PolygonEditModal from './PolygonEditModal';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});

const mapDrawTheme = [
  {
    'id': 'gl-draw-polygon-fill',
    'type': 'fill',
    'filter': ['all', ['==', '$type', 'Polygon']],
    'paint': {
      'fill-color': ['case', ['==', ['get', 'active'], 'true'], '#ef4444', '#3bb2d0'],
      'fill-opacity': ['case', ['==', ['get', 'active'], 'true'], 0.4, 0.1],
    },
  },
  {
    'id': 'gl-draw-lines',
    'type': 'line',
    'filter': ['any', ['==', '$type', 'LineString'], ['==', '$type', 'Polygon']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round',
    },
    'paint': {
      'line-color': ['case', ['==', ['get', 'active'], 'true'], '#ef4444', '#3bb2d0'],
      'line-width': ['case', ['==', ['get', 'active'], 'true'], 3, 2],
    },
  },
  {
    'id': 'gl-draw-point-outer',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'], ['==', 'meta', 'feature']],
    'paint': {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 7, 5],
      'circle-color': '#fff',
    },
  },
  {
    'id': 'gl-draw-point-inner',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'], ['==', 'meta', 'feature']],
    'paint': {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 5, 3],
      'circle-color': ['case', ['==', ['get', 'active'], 'true'], '#ef4444', '#3bb2d0'],
    },
  },
  {
    'id': 'gl-draw-vertex-outer',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex'], ['!=', 'mode', 'simple_select']],
    'paint': {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 7, 5],
      'circle-color': '#fff',
    },
  },
  {
    'id': 'gl-draw-vertex-inner',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex'], ['!=', 'mode', 'simple_select']],
    'paint': {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 5, 3],
      'circle-color': '#fbb03b',
    },
  },
  {
    'id': 'gl-draw-midpoint',
    'type': 'circle',
    'filter': ['all', ['==', 'meta', 'midpoint']],
    'paint': {
      'circle-radius': 3,
      'circle-color': '#fbb03b',
    },
  }
];

export function MapDrawCtrl() {
  const ctx = useContext(MapContext);
  const { canEdit } = useAuth();
  const drawControlRef = useRef<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawnCoordinates, setDrawnCoordinates] = useState<any[]>([]);
  const modeRef = useRef(ctx?.mode);
  
  useEffect(() => {
    modeRef.current = ctx?.mode;
  }, [ctx?.mode]);

  // States for Editing existing polygons
  const [editingPolygonInfo, setEditingPolygonInfo] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showBulkSaveBtn, setShowBulkSaveBtn] = useState(false);

  // Toggle Clear Button Visibility
  useEffect(() => {
    const container = document.getElementById('custom-clear-desa-container');
    if (container) {
      container.style.display = ctx?.selectedDesa ? 'block' : 'none';
    }
  }, [ctx?.selectedDesa]);

  // Handle Clear Desa Event
  useEffect(() => {
    const handleClear = () => {
      ctx?.setLayers({ desas: true, nops: false, bloks: false, bangunans: false });
      ctx?.setSelectedDesa(null);
      ctx?.setSelectedDesaName(null);
      if ((ctx as any).setActiveTematik) (ctx as any).setActiveTematik(null);
      
      const map = ctx?.map;
      if (map) {
        ['nops-fill', 'nops-line', 'nops-label', 'bloks-fill', 'bloks-line', 'bloks-label', 'bangunans-fill', 'bangunans-line', 'bangunans-label'].forEach((id) => {
           if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none');
        });
        ['desas-fill', 'desas-line', 'desas-label'].forEach((id) => {
           if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'visible');
        });
        map.flyTo({ center: [112.90, -7.64], zoom: 12.5, duration: 1500 });
      }
    };
    
    window.addEventListener('clearDesaSelection', handleClear);
    return () => window.removeEventListener('clearDesaSelection', handleClear);
  }, [ctx]);


  useEffect(() => {
    if (typeof document !== 'undefined' && !document.querySelector('link[data-mapboxdraw]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.4.3/mapbox-gl-draw.css';
      link.setAttribute('data-mapboxdraw', '1');
      document.head.appendChild(link);
    }
    if (typeof window !== 'undefined') {
      (window as any).mapboxgl = maplibregl;
    }
  }, []);

  // 1. Mount MapboxDraw and inject Edit Button when Desa is selected
  useEffect(() => {
    const map = ctx?.map;
    if (!map || !canEdit) return;

    if (true) {
      if (!drawControlRef.current) {
        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true,
          },
          styles: mapDrawTheme,
        });

        map.addControl(draw, 'top-left');
        drawControlRef.current = draw;

        // Inject Custom Edit Buttons below the trash icon
        setTimeout(() => {
          const drawGroups = document.querySelectorAll('.mapboxgl-ctrl-group');
          let targetGroup: any = null;
          drawGroups.forEach(group => {
            if (group.querySelector('.mapbox-gl-draw_ctrl-draw-btn')) {
              targetGroup = group;
            }
          });

          if (targetGroup) {
            // 1. Normal Edit Button (Pencil)
            const editBtn = document.createElement('button');
            editBtn.className = 'mapbox-gl-draw_ctrl-draw-btn custom-edit-toggle-btn';
            editBtn.title = 'Mode Edit Biasa (Buka Form)';
            
            editBtn.style.color = '#333333';
            editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin:6px auto;display:block;"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`;
            editBtn.onclick = () => window.dispatchEvent(new CustomEvent('toggleEditMode'));
            targetGroup.appendChild(editBtn);

            // 2. Fast Edit Button (Move/Arrows)
            const fastEditBtn = document.createElement('button');
            fastEditBtn.className = 'mapbox-gl-draw_ctrl-draw-btn custom-fast-edit-toggle-btn';
            fastEditBtn.title = 'Mode Geser Cepat (Auto-Save)';
            
            fastEditBtn.style.color = '#333333';
            fastEditBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin:6px auto;display:block;"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M9 19l3 3 3-3M19 9l3 3-3 3M2 12h20M12 2v20"/></svg>`;
            fastEditBtn.onclick = () => window.dispatchEvent(new CustomEvent('toggleFastEditMode'));
            targetGroup.appendChild(fastEditBtn);

            // 3. Bulk Edit Button (Area Select)
            const bulkEditBtn = document.createElement('button');
            bulkEditBtn.className = 'mapbox-gl-draw_ctrl-draw-btn custom-bulk-edit-toggle-btn';
            bulkEditBtn.title = 'Geser Massal (Pilih Area)';
            bulkEditBtn.style.color = '#333333';
            bulkEditBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin:6px auto;display:block;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M9 3v18"/><path d="M15 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>`;
            bulkEditBtn.onclick = () => window.dispatchEvent(new CustomEvent('toggleBulkEditMode'));
            targetGroup.appendChild(bulkEditBtn);
            // 4. Clear Desa Button (Separated)
            if (!document.getElementById('custom-clear-desa-container')) {
                const clearBtnContainer = document.createElement('div');
                clearBtnContainer.id = 'custom-clear-desa-container';
                clearBtnContainer.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
                clearBtnContainer.style.marginTop = '10px';
                clearBtnContainer.style.display = 'none';

                const clearBtn = document.createElement('button');
                clearBtn.id = 'custom-clear-desa-btn';
                clearBtn.className = 'mapbox-gl-draw_ctrl-draw-btn custom-clear-desa-btn';
                clearBtn.title = 'Reset Tampilan / Bersihkan Area (Kembali ke Tampilan Kota)';
                clearBtn.style.color = '#333333';
                clearBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin:6px auto;display:block;"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`;
                
                clearBtn.onclick = () => window.dispatchEvent(new CustomEvent('clearDesaSelection'));
                clearBtnContainer.appendChild(clearBtn);
                
                targetGroup.parentNode.appendChild(clearBtnContainer);
            }

            
            // Re-apply active styles immediately if mode was already edit/fast-edit
            if (ctx?.mode === 'edit') {
              editBtn.classList.add('active'); 
            } else if (ctx?.mode === 'fast-edit') {
              fastEditBtn.classList.add('active'); 
            } else if (ctx?.mode === 'bulk-edit') {
              bulkEditBtn.classList.add('active');
            }
          }
        }, 100);

        const handleCreate = async (e: any) => {
          const feature = e.features[0];
          
          if (modeRef.current === 'bulk-edit') {
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
                      body: JSON.stringify({ geometry, desaKode: ctx.selectedDesa, layers: ctx.layers })
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
        };

        map.on('draw.create', handleCreate);
        (drawControlRef as any)._handleCreate = handleCreate; // save for cleanup
      }
    } else {
      if (drawControlRef.current) {
        if ((drawControlRef as any)._handleCreate) {
          map.off('draw.create', (drawControlRef as any)._handleCreate);
        }
        map.removeControl(drawControlRef.current);
        drawControlRef.current = null;
        setEditingPolygonInfo(null);
        setEditModalOpen(false);
      }
    }
  }, [ctx?.map, ctx?.selectedDesa]); // intentionally omitting ctx.mode to prevent remounting

  // 2. Listen for the custom event to toggle edit mode
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
  }, [ctx]);

  // 3. Highlight the custom edit button based on mode (using theme green)
  useEffect(() => {
    if (!canEdit) return;
    const editBtn = document.querySelector('.custom-edit-toggle-btn') as HTMLElement;
    const fastEditBtn = document.querySelector('.custom-fast-edit-toggle-btn') as HTMLElement;
    
    if (editBtn) {
      if (ctx?.mode === 'edit') {
        editBtn.style.color = '#059669'; editBtn.style.backgroundColor = '#ecfdf5';
      } else {
        editBtn.style.color = '#333333'; editBtn.style.backgroundColor = '';
      }
    }
    
    if (fastEditBtn) {
      if (ctx?.mode === 'fast-edit') {
        fastEditBtn.style.color = '#059669'; fastEditBtn.style.backgroundColor = '#ecfdf5';
      } else {
        fastEditBtn.style.color = '#333333'; fastEditBtn.style.backgroundColor = '';
      }
    }
  }, [ctx?.mode]);

  // 4. Handle map clicks for editing existing polygons when in edit mode
  useEffect(() => {
    const map = ctx?.map;
    if (!map || !canEdit) return;

    if ((ctx?.mode === 'edit' || ctx?.mode === 'fast-edit') && drawControlRef.current) {
      const handleMapClick = async (e: any) => {
        try {
          const features = map.queryRenderedFeatures(e.point, { layers: ['nops-fill', 'bloks-fill', 'bangunans-fill', 'desas-fill'] });
          if (features.length > 0) {
            const feature = features[0];
            let type = 'nop';
            if (feature.layer.id.includes('nops')) type = 'nop';
            else if (feature.layer.id.includes('bloks')) type = 'blok';
            else if (feature.layer.id.includes('bangunans')) type = 'bangunan';
            else if (feature.layer.id.includes('desas')) type = 'desa';
            const code = feature.properties.d_nop || feature.properties.d_blok || feature.properties.d_kd_kel || feature.properties.id || '';
            const id = feature.properties.id || feature.id;

            if (!id) {
              Swal.fire('Gagal!', 'Gagal mendapatkan ID polygon dari peta. Pastikan poligon telah disimpan sempurna.', 'error');
              return;
            }

            const res = await fetch(`/api/polygon-get?id=${id}&type=${type}`);
            const data = await res.json();
            
            if (data.geometry) {
              const geojsonFeature = {
                id: id.toString(),
                type: 'Feature',
                // Store DB mapping for auto-save!
                properties: { ...feature.properties, db_id: id, db_type: type, db_code: code },
                geometry: data.geometry
              };
              
              const draw = drawControlRef.current;
              draw.deleteAll();
              draw.add(geojsonFeature);
              draw.changeMode('direct_select', { featureId: geojsonFeature.id });
              
              if (ctx.mode === 'edit') {
                setEditingPolygonInfo({
                  featureId: geojsonFeature.id,
                  id,
                  type,
                  code,
                  coordinates: data.geometry.coordinates
                });
              } else {
                // In fast-edit mode, we don't open the bottom floating bar for the popup!
                setEditingPolygonInfo(null);
                setEditModalOpen(false);
              }
            } else {
               Swal.fire('Gagal!', 'Gagal mengambil data geometri asli dari server: ' + (data.error || 'Unknown error'), 'error');
            }
          }
        } catch (err: any) {
          console.error('Error fetching exact geometry:', err);
          Swal.fire('Error!', 'Terjadi kesalahan saat memuat poligon: ' + err.message, 'error');
        }
      };
      
      const handleDrawUpdate = async (e: any) => {
         if (ctx?.mode !== 'fast-edit') return;
         
         for (const feature of e.features) {
            const props = feature.properties;
            if (!props.db_id) continue;
            
            const formData = new FormData();
            formData.append('type', props.db_type);
            formData.append('id', props.db_id); 
            formData.append('code', props.db_code);
            formData.append('coordinates', JSON.stringify(feature.geometry.coordinates));

            try {
              const res = await fetch('/api/polygon-update', { method: 'POST', body: formData });
              if (!res.ok) throw new Error('Simpan gagal');
              // Automatically refresh the layer to show the newly saved shape instantly
              refreshLayer(props.db_type);
              
              Toast.fire({
                icon: 'success',
                title: `${props.db_type.toUpperCase()} ${props.db_code} berhasil diperbarui!`
              });
            } catch (err: any) {
              Swal.fire('Auto-Save Gagal!', 'Gagal auto-save poligon: ' + err.message, 'error');
            }
         }
      };

      const handleSelectionChange = (e: any) => {
         // Di fast-edit, jika user klik di luar polygon (unselect), kita bersihkan layernya
         if (ctx?.mode === 'fast-edit' && e.features.length === 0) {
            drawControlRef.current?.deleteAll();
         }
      };

      map.on('click', handleMapClick);
      map.on('draw.update', handleDrawUpdate);
      map.on('draw.selectionchange', handleSelectionChange);
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
                   ['nops', 'bloks', 'bangunans'].forEach(layer => {
                       const source = map.getSource(layer);
                       if (source && (source as any).setTiles) {
                           (source as any).setTiles([`/api/tiles/${layer}/{z}/{x}/{y}?desa=${ctx.selectedDesa}&t=${Date.now()}`]);
                           if ((source as any).clearTiles) (source as any).clearTiles();
                       }
                   });
                   // Refresh desas geojson if it was edited
                   const desasSource = map.getSource('desas');
                   if (desasSource && (desasSource as any).setData) {
                       fetch('/api/desas/all').then(r => r.json()).then(data => (desasSource as any).setData(data));
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
        map.off('click', handleMapClick);
        map.off('draw.update', handleDrawUpdate);
        map.off('draw.selectionchange', handleSelectionChange);
      };
    }
  }, [ctx?.map, ctx?.mode]);

  // 5. Clear drawings when tool is turned off completely
  useEffect(() => {
    if (!canEdit) return;
    if (ctx?.mode === 'view' && drawControlRef.current) {
       drawControlRef.current.deleteAll();
       setEditingPolygonInfo(null);
       setEditModalOpen(false);
    }
  }, [ctx?.mode]);

  const handleSavePolygon = async (data: any) => {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('code', data.nop);
    formData.append('coordinates', JSON.stringify(data.coordinates));

    if (data.files && data.files.length > 0) {
      data.files.forEach((file: File) => {
        formData.append('files', file);
      });
    }

    const response = await fetch('/api/polygon-save', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Gagal menyimpan polygon');
    }

    Swal.fire('Berhasil!', 'Polygon berhasil disimpan!', 'success');
    
    if (drawControlRef.current) {
      drawControlRef.current.deleteAll();
    }
    
    refreshLayer(data.type);
  };

  const handleUpdatePolygon = async (data: any) => {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('id', data.id);
    formData.append('code', data.code);
    formData.append('coordinates', JSON.stringify(data.coordinates));
    
    if (data.files && data.files.length > 0) {
      data.files.forEach((file: File) => {
        formData.append('newFiles', file);
      });
    }

    const response = await fetch('/api/polygon-update', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Gagal mengupdate polygon');
    }

    Swal.fire('Berhasil!', 'Perubahan polygon berhasil disimpan!', 'success');
    setEditModalOpen(false);
    setEditingPolygonInfo(null);
    
    if (drawControlRef.current) {
      drawControlRef.current.deleteAll();
    }
    
    refreshLayer(data.type);
  };

  const refreshLayer = (type: string) => {
    const layerId = type === 'nop' ? 'nops' : type === 'blok' ? 'bloks' : 'bangunans';
    const mapObj = ctx?.map as any;
    if (mapObj && mapObj.style && mapObj.style.sourceCaches) {
      const sourceCache = mapObj.style.sourceCaches[layerId];
      if (sourceCache) {
        sourceCache.clearTiles();
        sourceCache.update(mapObj.transform);
        mapObj.triggerRepaint();
      }
    }
  };

  if (!canEdit) return null;

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
                   ['nops', 'bloks', 'bangunans'].forEach(layer => {
                       const source = map.getSource(layer);
                       if (source && (source as any).setTiles) {
                           (source as any).setTiles([`/api/tiles/${layer}/{z}/{x}/{y}?desa=${ctx.selectedDesa}&t=${Date.now()}`]);
                           if ((source as any).clearTiles) (source as any).clearTiles();
                       }
                   });
                   // Refresh desas geojson if it was edited
                   const desasSource = map.getSource('desas');
                   if (desasSource && (desasSource as any).setData) {
                       fetch('/api/desas/all').then(r => r.json()).then(data => (desasSource as any).setData(data));
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



  return (
    <>
      {/* Fast Edit Save Button */}
      {showBulkSaveBtn && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[1000] flex gap-2">
           <button
             onClick={handleBulkSave}
             className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
             Simpan Pergeseran Massal
           </button>
           <button
             onClick={() => {
                if (drawControlRef.current) drawControlRef.current.deleteAll();
                setShowBulkSaveBtn(false);
                ctx?.setMode('view');
             }}
             className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
           >
             Batal
           </button>
        </div>
      )}
      
      {editingPolygonInfo && !editModalOpen && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[1000] bg-white px-6 py-3 rounded-full shadow-2xl border border-emerald-100 flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Sedang mengedit {editingPolygonInfo.type.toUpperCase()} ({editingPolygonInfo.code})</span>
          <div className="flex gap-2">
             <button 
                onClick={() => {
                   if (drawControlRef.current) drawControlRef.current.deleteAll();
                   setEditingPolygonInfo(null);
                }}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
             >
                Batal
             </button>
             <button 
                onClick={() => {
                   const feature = drawControlRef.current.get(editingPolygonInfo.featureId);
                   if (feature) {
                      setEditingPolygonInfo((prev: any) => ({...prev, coordinates: feature.geometry.coordinates}));
                   }
                   setEditModalOpen(true);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow"
             >
                Simpan Perubahan
             </button>
          </div>
        </div>
      )}

      <SavePolygonModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          if (drawControlRef.current) drawControlRef.current.deleteAll();
        }}
        onSave={handleSavePolygon}
        coordinates={drawnCoordinates}
        defaultDesaKode={ctx?.selectedDesa || ''}
      />

      {editingPolygonInfo && (
        <PolygonEditModal
           isOpen={editModalOpen}
           onClose={() => setEditModalOpen(false)}
           onSave={handleUpdatePolygon}
           type={editingPolygonInfo.type}
           id={editingPolygonInfo.id}
           code={editingPolygonInfo.code}
           coordinates={editingPolygonInfo.coordinates}
        />
      )}
    </>
  );
}
