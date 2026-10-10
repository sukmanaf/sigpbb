import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

# 1. Remove the floating button
floating_btn_pattern = r'\{\/\* Clear Desa Button \*\/\}\s*\{ctx\?\.selectedDesa && \([\s\S]*?\}\s*\)\s*\}'
content = re.sub(floating_btn_pattern, '', content)


# 2. Inject the button into the Mapbox Draw group
inject_btn = """            // 4. Clear Desa Button
            if (!document.getElementById('custom-clear-desa-btn')) {
                const clearBtn = document.createElement('button');
                clearBtn.id = 'custom-clear-desa-btn';
                clearBtn.className = 'mapbox-gl-draw_ctrl-draw-btn custom-clear-desa-btn';
                clearBtn.title = 'Tutup Desa (Kembali ke Tampilan Kota)';
                clearBtn.style.color = '#ef4444';
                clearBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin:6px auto;display:block;"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>`;
                clearBtn.style.display = 'none';
                clearBtn.onclick = () => window.dispatchEvent(new CustomEvent('clearDesaSelection'));
                targetGroup.appendChild(clearBtn);
            }
"""
content = content.replace("targetGroup.appendChild(bulkEditBtn);", "targetGroup.appendChild(bulkEditBtn);\n" + inject_btn)


# 3. Add the event listener and toggle logic
event_logic = """
  // Toggle Clear Button Visibility
  useEffect(() => {
    const btn = document.getElementById('custom-clear-desa-btn');
    if (btn) {
      btn.style.display = ctx?.selectedDesa ? 'block' : 'none';
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
"""
# Insert before `return (` at the bottom
content = content.replace("  return (\n    <>\n", event_logic + "\n  return (\n    <>\n")

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)
