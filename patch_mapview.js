const fs = require('fs');
const file = '/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import MapboxDraw")) {
  content = content.replace("import maplibre from 'maplibre-gl';", "import maplibre from 'maplibre-gl';\nimport MapboxDraw from '@mapbox/mapbox-gl-draw';");
}

if (!content.includes("data-mapboxdraw")) {
  const cssInject = `
      if (!document.querySelector('link[data-mapboxdraw]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.4.3/mapbox-gl-draw.css';
        link.setAttribute('data-mapboxdraw', '1');
        document.head.appendChild(link);
      }
      // MapboxDraw needs mapboxgl on window
      if (typeof window !== 'undefined') {
        (window as any).mapboxgl = maplibre;
      }
  `;
  content = content.replace("document.head.appendChild(link);\n      }", "document.head.appendChild(link);\n      }\n" + cssInject);
}

if (!content.includes("drawControlRef")) {
  content = content.replace("const mapRef = useRef<maplibre.Map | null>(null);", "const mapRef = useRef<maplibre.Map | null>(null);\n  const drawControlRef = useRef<any>(null);");
}

if (!content.includes("draw.create")) {
  const drawLogic = `
  // Handle Edit Mode Toggle
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    if (ctx?.mode === 'edit') {
      if (!drawControlRef.current) {
        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: { polygon: true, trash: true },
        });
        map.addControl(draw, 'top-center');
        drawControlRef.current = draw;

        map.on('draw.create', (e: any) => {
          const feature = e.features[0];
          console.log('Polygon created:', feature);
          // TODO: Open Save Modal here!
          alert('Polygon created! Ready to save (Modal coming soon).');
        });
      }
    } else {
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      }
    }
  }, [mapLoaded, ctx?.mode]);
  `;
  content = content.replace("// Click handlers (re-attached when mapLoaded or mode changes)", drawLogic + "\n  // Click handlers (re-attached when mapLoaded or mode changes)");
}

fs.writeFileSync(file, content);
