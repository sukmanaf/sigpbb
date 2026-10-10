import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapUIOverlay.tsx', 'r') as f:
    content = f.read()

old_block = """  const handlePrint = () => {
    const canvas = document.querySelector('.mapboxgl-canvas') as HTMLElement;
    if (canvas) {
      // Fix canvas to absolute center using exact pixel margins
      // This bypasses Chrome print bugs with CSS transforms on canvases
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      
      canvas.style.position = 'absolute';
      canvas.style.left = '50%';
      canvas.style.top = '50%';
      canvas.style.marginLeft = `-${width / 2}px`;
      canvas.style.marginTop = `-${height / 2}px`;
    }
    
    // Small delay to let browser apply styles
    setTimeout(() => {
      window.print();
      
      // Restore styles after print dialog closes
      if (canvas) {
        canvas.style.position = '';
        canvas.style.left = '';
        canvas.style.top = '';
        canvas.style.marginLeft = '';
        canvas.style.marginTop = '';
      }
    }, 150);
  };"""

new_block = """  const handlePrint = () => {
    const canvas = document.querySelector('.mapboxgl-canvas') as HTMLCanvasElement;
    if (!canvas) {
      window.print();
      return;
    }

    try {
        // Create an image snapshot of the WebGL canvas
        const imgData = canvas.toDataURL('image/png');
        
        const img = document.createElement('img');
        img.src = imgData;
        img.id = 'print-overlay-image';
        
        // Center the image absolutely
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        img.style.position = 'absolute';
        img.style.left = '50%';
        img.style.top = '50%';
        img.style.marginLeft = `-${width / 2}px`;
        img.style.marginTop = `-${height / 2}px`;
        img.style.width = `${width}px`;
        img.style.height = `${height}px`;
        img.style.zIndex = '10'; // Behind the UI overlays but above mapbox layers
        img.style.pointerEvents = 'none';

        const mapContainer = document.querySelector('.mapboxgl-map');
        const canvasContainer = document.querySelector('.mapboxgl-canvas-container') as HTMLElement;
        
        if (mapContainer && canvasContainer) {
            mapContainer.appendChild(img);
            // Hide the actual WebGL canvas so it doesn't interfere
            canvasContainer.style.display = 'none';
        }

        setTimeout(() => {
            window.print();
            
            // Cleanup after print dialog
            const addedImg = document.getElementById('print-overlay-image');
            if (addedImg) addedImg.remove();
            if (canvasContainer) canvasContainer.style.display = '';
        }, 300); // give the browser a bit of time to render the image
    } catch (e) {
        console.error("Print image generation failed", e);
        window.print(); // fallback
    }
  };"""

content = content.replace(old_block, new_block)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapUIOverlay.tsx', 'w') as f:
    f.write(content)
