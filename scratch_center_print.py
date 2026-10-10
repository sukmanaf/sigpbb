import re

with open('/home/wgipro/koding/newmap/my-app/app/globals.css', 'r') as f:
    content = f.read()

old_block = """  /* Do NOT change the size of the map container in print media! 
     Changing size in @media print causes WebGL to clear the canvas and go blank. */
  
  /* We preserve the layout so the canvas renders perfectly. */
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}"""

new_block = """  /* MapLibre canvas does not resize synchronously during print, 
     so it remains screen-sized (e.g. 1920x1080).
     To ensure the printed page captures the center of the map, 
     we center the oversized canvas inside the print page using transform. */
  .mapboxgl-canvas {
    position: absolute !important;
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%) !important;
  }

  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}"""

content = content.replace(old_block, new_block)

with open('/home/wgipro/koding/newmap/my-app/app/globals.css', 'w') as f:
    f.write(content)
