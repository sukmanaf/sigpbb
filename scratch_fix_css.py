import re

with open('/home/wgipro/koding/newmap/my-app/app/globals.css', 'r') as f:
    content = f.read()

# Replace everything from /* --- MAPBOX DRAW CUSTOM STYLING to the end
new_css = """/* --- MAPBOX CUSTOM STYLING (MATCH UI OVERLAY) --- */

.maplibregl-ctrl-top-left .mapboxgl-ctrl {
  clear: both !important;
  float: left !important;
  margin: 16px 0 0 16px !important; /* Match absolute top-4 left-4 */
  pointer-events: auto !important;
}

.maplibregl-ctrl-bottom-right .mapboxgl-ctrl {
  margin: 0 16px 16px 0 !important; /* Match bottom-4 right-4 */
}

/* Reset container to match rounded-lg shadow-md border-gray-200 */
.mapboxgl-ctrl-group {
  background: #fff !important;
  border-radius: 0.5rem !important; /* rounded-lg */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important; /* shadow-md */
  border: 1px solid #e5e7eb !important; /* border-gray-200 */
  display: block !important;
  overflow: hidden !important;
  padding: 0 !important;
}

/* Size buttons to w-10 h-10 (40px) */
.mapboxgl-ctrl-group button {
  width: 40px !important;
  height: 40px !important;
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
  color: #374151 !important; /* text-gray-700 */
  transition: all 150ms ease-in-out !important;
}

/* Separator lines */
.mapboxgl-ctrl-group button + button {
  border-top: 1px solid #e5e7eb !important; /* border-gray-200 */
}

/* Center SVGs inside custom buttons */
.mapboxgl-ctrl-group button svg {
  margin: 12px auto !important; /* Center in 40px */
}

/* Hover styles */
.mapboxgl-ctrl-group button:hover {
  background-color: #f9fafb !important; /* hover:bg-gray-50 */
  color: #059669 !important; /* hover:text-emerald-600 */
}

/* Apply CSS filter to MapLibre/MapboxDraw background-image icons on hover so they turn green */
.mapboxgl-ctrl-group button:hover .maplibregl-ctrl-icon,
.mapboxgl-ctrl-group button:hover.mapbox-gl-draw_polygon,
.mapboxgl-ctrl-group button:hover.mapbox-gl-draw_trash {
  /* Hex #059669 approximate filter from black */
  filter: invert(34%) sepia(87%) saturate(2469%) hue-rotate(137deg) brightness(97%) contrast(96%) !important;
}

/* Active styles */
.mapboxgl-ctrl-group button.active {
  background-color: #ecfdf5 !important;
  color: #059669 !important;
}
"""

content = re.sub(
    r"\/\* --- MAPBOX DRAW CUSTOM STYLING --- \*\/.*",
    new_css,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/app/globals.css', 'w') as f:
    f.write(content)
