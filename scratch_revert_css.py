import re

with open('/home/wgipro/koding/newmap/my-app/app/globals.css', 'r') as f:
    content = f.read()

# The original CSS exact text
original_css = """/* --- MAPBOX DRAW CUSTOM STYLING --- */

/* --- MAPBOX DRAW CUSTOM STYLING (MATCH NATIVE MAPLIBRE) --- */

/* Samakan persis letak margin dan floating dengan bawaan MapLibre */
.maplibregl-ctrl-top-left .mapboxgl-ctrl {
  clear: both !important;
  float: left !important;
  margin: 10px 0 0 10px !important;
  pointer-events: auto !important;
}

/* Reset container agar menyatu seperti kontrol zoom bawaan */
.mapboxgl-ctrl-group {
  background: #fff !important;
  border-radius: 4px !important;
  box-shadow: 0 0 0 2px rgba(0,0,0,.1) !important;
  display: block !important;
  overflow: hidden !important;
  padding: 0 !important;
}

/* Ukuran tombol persis disamakan dengan Zoom Control MapLibre (29x29px) */
.mapboxgl-ctrl-group button.mapbox-gl-draw_polygon,
.mapboxgl-ctrl-group button.mapbox-gl-draw_trash {
  width: 29px !important;
  height: 29px !important;
  display: block !important;
  padding: 0 !important;
  border: 0 !important;
  box-sizing: border-box !important;
  background-color: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  float: none !important;
  margin: 0 !important;
  outline: none !important;
  cursor: pointer !important;
}

/* Beri garis pemisah persis seperti di antara tombol + dan - */
.mapboxgl-ctrl-group button.mapbox-gl-draw_trash {
  border-top: 1px solid #ddd !important;
}

/* Hover effect bawaan maplibre */
.mapboxgl-ctrl-group button.mapbox-gl-draw_polygon:hover,
.mapboxgl-ctrl-group button.mapbox-gl-draw_trash:hover {
  background-color: rgba(0, 0, 0, 0.05) !important;
}

/* Active effect */
.mapboxgl-ctrl-group button.mapbox-gl-draw_polygon.active {
  background-color: #ecfdf5 !important;
}


/* Force custom edit buttons to stack vertically below the trash button */
.mapboxgl-ctrl-group button.custom-edit-toggle-btn,
.mapboxgl-ctrl-group button.custom-fast-edit-toggle-btn {
  width: 29px !important;
  height: 29px !important;
  display: block !important;
  padding: 0 !important;
  border: 0 !important;
  box-sizing: border-box !important;
  background-color: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  float: none !important;
  margin: 0 !important;
  border-top: 1px solid #ddd !important;
}

.mapboxgl-ctrl-group button.custom-edit-toggle-btn:hover,
.mapboxgl-ctrl-group button.custom-fast-edit-toggle-btn:hover {
  background-color: rgba(0, 0, 0, 0.05) !important;
}
"""

content = re.sub(
    r"\/\* --- MAPBOX CUSTOM STYLING \(MATCH UI OVERLAY\) --- \*\/.*",
    original_css,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/app/globals.css', 'w') as f:
    f.write(content)
