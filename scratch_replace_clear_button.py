import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

# I need to find the Clear Desa Button block
pattern = r'\{\/\* Clear Desa Button \*\/\}\s*\{ctx\?\.selectedDesa && \([\s\S]*?\)\}'

new_button = """{/* Clear Desa Button */}
      {ctx?.selectedDesa && (
        <div className="mapboxgl-ctrl mapboxgl-ctrl-group" style={{ position: 'absolute', top: '230px', left: '10px', zIndex: 999 }}>
          <button 
             title="Bersihkan Seleksi (Kembali ke Kota)"
             className="mapbox-gl-draw_ctrl-draw-btn"
             style={{ width: '29px', height: '29px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
             onClick={() => {
                ctx.setLayers({ desas: true, nops: false, bloks: false, bangunans: false });
                ctx.setSelectedDesa(null);
                ctx.setSelectedDesaName(null);
                if ((ctx as any).setActiveTematik) (ctx as any).setActiveTematik(null);
                
                const map = ctx.map;
                if (map) {
                  ['nops-fill', 'nops-line', 'nops-label', 'bloks-fill', 'bloks-line', 'bloks-label', 'bangunans-fill', 'bangunans-line', 'bangunans-label'].forEach((id) => {
                     if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none');
                  });
                  ['desas-fill', 'desas-line', 'desas-label'].forEach((id) => {
                     if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'visible');
                  });
                  map.flyTo({ center: [112.90, -7.64], zoom: 12.5, duration: 1500 });
                }
             }}
          >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="#333" style={{ margin: '0 auto', display: 'block' }}><path d="M495.5 16.5C506.4 27.5 512 42.4 512 57.9c0 15.5-5.6 30.4-16.5 41.4l-118 118 0 83.2c0 31.6-18.7 59.8-47.5 72.8l-123.6 55.7c-9.1 4.1-19.8-1.5-21.7-11.4L156.4 336 16 307.7c-9.9-1.9-15.5-12.6-11.4-21.7l55.7-123.6C73.4 133.6 101.6 115 133.2 115l83.2 0 118-118c11-11 25.9-16.5 41.4-16.5s30.4 5.6 41.4 16.5l78.4 78.4zM256 256l-114.9 114.9L55.5 285.3 170.4 170.4 256 256zM85.6 426.4c-14.7 14.7-38.6 14.7-53.3 0s-14.7-38.6 0-53.3l55.4-55.4L173.3 403 85.6 426.4z"/></svg>
          </button>
        </div>
      )}"""

content = re.sub(pattern, new_button, content)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)
