import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

# 1. Update the injection logic
old_injection = """            // 4. Clear Desa Button
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
            }"""

new_injection = """            // 4. Clear Desa Button (Separated)
            if (!document.getElementById('custom-clear-desa-container')) {
                const clearBtnContainer = document.createElement('div');
                clearBtnContainer.id = 'custom-clear-desa-container';
                clearBtnContainer.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
                clearBtnContainer.style.marginTop = '10px';
                clearBtnContainer.style.display = 'none';

                const clearBtn = document.createElement('button');
                clearBtn.id = 'custom-clear-desa-btn';
                clearBtn.className = 'mapbox-gl-draw_ctrl-draw-btn custom-clear-desa-btn';
                clearBtn.title = 'Bersihkan Area (Kembali ke Tampilan Kota)';
                clearBtn.style.color = '#333333';
                clearBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin:6px auto;display:block;"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>`;
                
                clearBtn.onclick = () => window.dispatchEvent(new CustomEvent('clearDesaSelection'));
                clearBtnContainer.appendChild(clearBtn);
                
                targetGroup.parentNode.appendChild(clearBtnContainer);
            }"""

content = content.replace(old_injection, new_injection)

# 2. Update the toggle visibility logic
old_toggle = """  // Toggle Clear Button Visibility
  useEffect(() => {
    const btn = document.getElementById('custom-clear-desa-btn');
    if (btn) {
      btn.style.display = ctx?.selectedDesa ? 'block' : 'none';
    }
  }, [ctx?.selectedDesa]);"""

new_toggle = """  // Toggle Clear Button Visibility
  useEffect(() => {
    const container = document.getElementById('custom-clear-desa-container');
    if (container) {
      container.style.display = ctx?.selectedDesa ? 'block' : 'none';
    }
  }, [ctx?.selectedDesa]);"""

content = content.replace(old_toggle, new_toggle)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)
