import re

with open('/home/wgipro/koding/newmap/my-app/app/globals.css', 'r') as f:
    content = f.read()

# Replace the broad print block with a more targeted one
old_print = r'\/\* ==========================================================================\n   PRINT MAP STYLES[\s\S]*'
new_print = """/* ==========================================================================
   PRINT MAP STYLES
   ========================================================================== */
@media print {
  @page {
    size: landscape;
    margin: 0;
  }
  
  body * {
    visibility: hidden;
  }

  /* Make map wrapper and its canvas visible */
  .mapboxgl-map, 
  .mapboxgl-map *,
  .legend-container,
  .legend-container * {
    visibility: visible;
  }

  /* Specifically hide Mapbox UI controls */
  .mapboxgl-ctrl-top-left, 
  .mapboxgl-ctrl-top-right, 
  .mapboxgl-ctrl-bottom-right,
  .mapboxgl-ctrl-bottom-left {
    display: none !important;
  }

  /* Ensure map fills the page */
  .mapboxgl-map {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 9999;
  }

  /* Ensure legend is positioned correctly on print */
  .legend-container {
    position: fixed !important;
    bottom: 20px !important;
    left: 20px !important;
    z-index: 10000;
  }
}
"""

content = re.sub(old_print, new_print, content)

with open('/home/wgipro/koding/newmap/my-app/app/globals.css', 'w') as f:
    f.write(content)
