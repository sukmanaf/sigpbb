import re

with open('/home/wgipro/koding/newmap/my-app/app/globals.css', 'r') as f:
    content = f.read()

old_block = """@media print {
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
  .ui-overlay-tools,
  .print-hide {
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

new_block = """@media print {
  @page {
    size: landscape;
    margin: 0;
  }

  /* Hide only UI overlays and mapbox controls to prevent Mapbox WebGL resize blanking */
  .mapboxgl-ctrl-top-left, 
  .mapboxgl-ctrl-top-right, 
  .mapboxgl-ctrl-bottom-right,
  .mapboxgl-ctrl-bottom-left,
  .ui-overlay-tools,
  .print-hide {
    display: none !important;
  }

  /* Do NOT change the size of the map container in print media! 
     Changing size in @media print causes WebGL to clear the canvas and go blank. */
  
  /* We preserve the layout so the canvas renders perfectly. */
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}"""

content = content.replace(old_block, new_block)

with open('/home/wgipro/koding/newmap/my-app/app/globals.css', 'w') as f:
    f.write(content)
