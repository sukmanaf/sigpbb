import re

with open('/home/wgipro/koding/newmap/my-app/app/globals.css', 'r') as f:
    content = f.read()

# Replace the print media query
old_block = """@media print {
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
}"""

new_block = """@media print {
  @page {
    size: landscape;
    margin: 0;
  }

  /* Hide everything we don't want */
  nav, header, footer, 
  .mapboxgl-ctrl-top-left, 
  .mapboxgl-ctrl-top-right, 
  .mapboxgl-ctrl-bottom-right,
  .mapboxgl-ctrl-bottom-left,
  .ui-overlay-tools {
    display: none !important;
  }

  /* Ensure the main layout takes full screen without scrollbars */
  body, html, #__next, .h-screen {
    height: 100% !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  /* Force the map container to take the full space */
  .flex-1 {
    flex: 1 1 100% !important;
    height: 100vh !important;
    width: 100vw !important;
  }

  /* Mapbox canvas should fill exactly its container */
  .mapboxgl-map, .mapboxgl-canvas {
    width: 100% !important;
    height: 100% !important;
  }
}"""

content = content.replace(old_block, new_block)

with open('/home/wgipro/koding/newmap/my-app/app/globals.css', 'w') as f:
    f.write(content)
