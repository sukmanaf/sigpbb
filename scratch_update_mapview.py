import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'r') as f:
    content = f.read()

# 1. Add fetchGoogleMapToken function inside MapView
fetch_func = """  const [basemap, setBasemap] = useState('osm');
  
  // Cache for google sessions so we don't fetch multiple times for the same type
  const googleSessions = useRef<Record<string, string>>({});

  const loadGoogleBasemap = async (map: any, mapType: string, layerId: string) => {
    // Determine the internal Google mapType and overlay
    let gMapType = 'roadmap';
    let overlay = false;
    
    if (mapType === 'google-satellite') gMapType = 'satellite';
    if (mapType === 'google-hybrid') { gMapType = 'satellite'; overlay = true; }
    if (mapType === 'google-terrain') gMapType = 'terrain';

    const sessionKey = `${gMapType}-${overlay}`;

    try {
      let sessionToken = googleSessions.current[sessionKey];
      
      // Only fetch if we don't have it cached in memory, and API key exists
      if (!sessionToken && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        const res = await fetch(`/api/maps/session?mapType=${gMapType}&overlay=${overlay}`);
        const data = await res.json();
        if (data.session) {
          sessionToken = data.session;
          googleSessions.current[sessionKey] = sessionToken;
        }
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      // Fallback URL if no API key or session fails
      let tileUrl = `https://mt1.google.com/vt/lyrs=${mapType === 'google-satellite' || mapType === 'google-hybrid' ? 's' : mapType === 'google-terrain' ? 'p' : 'm'}&x={x}&y={y}&z={z}`;
      
      if (sessionToken && apiKey) {
        tileUrl = `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${sessionToken}&key=${apiKey}`;
      }

      // If source already exists, just update tiles
      if (map.getSource(layerId)) {
        if (map.getSource(layerId).setTiles) {
          map.getSource(layerId).setTiles([tileUrl]);
        }
      } else {
        // Add source and layer dynamically
        map.addSource(layerId, {
          type: 'raster',
          tiles: [tileUrl],
          tileSize: 256,
          maxzoom: 21,
          attribution: '© Google',
        });
        
        // Add layer BEFORE our vector layers
        // Find the first vector layer to insert before
        const firstVector = map.getStyle().layers.find((l: any) => l.type === 'fill' || l.type === 'line');
        
        map.addLayer({
          id: `${layerId}-background`,
          type: 'raster',
          source: layerId,
          minzoom: 0,
          maxzoom: 22,
          layout: { visibility: 'visible' },
        }, firstVector ? firstVector.id : undefined);
      }
    } catch (err) {
      console.error('Failed to load Google basemap', err);
    }
  };"""

content = re.sub(r"  const \[basemap, setBasemap\] = useState\('osm'\);", fetch_func, content)

# 2. Update handleBasemapChange
old_handle = """  const handleBasemapChange = (id: string) => {
    setBasemap(id);
    if (mapRef.current) {
      if (id === 'osm') {
        mapRef.current.setLayoutProperty('osm-background', 'visibility', 'visible');
        mapRef.current.setLayoutProperty('google-satellite-background', 'visibility', 'none');
      } else if (id === 'google-satellite') {
        mapRef.current.setLayoutProperty('osm-background', 'visibility', 'none');
        mapRef.current.setLayoutProperty('google-satellite-background', 'visibility', 'visible');
      }
    }
  };"""

new_handle = """  const handleBasemapChange = async (id: string) => {
    setBasemap(id);
    const map = mapRef.current;
    if (!map) return;

    // Hide all existing background layers first
    const bgLayers = ['osm-background', 'google-roadmap-background', 'google-satellite-background', 'google-hybrid-background', 'google-terrain-background'];
    bgLayers.forEach(layer => {
      if (map.getLayer(layer)) {
        map.setLayoutProperty(layer, 'visibility', 'none');
      }
    });

    if (id === 'osm') {
      if (map.getLayer('osm-background')) map.setLayoutProperty('osm-background', 'visibility', 'visible');
    } else if (id.startsWith('google-')) {
      // If the layer doesn't exist yet, load it dynamically
      if (!map.getLayer(`${id}-background`)) {
        await loadGoogleBasemap(map, id, id);
      } else {
        map.setLayoutProperty(`${id}-background`, 'visibility', 'visible');
      }
    }
  };"""

content = content.replace(old_handle, new_handle)

# 3. Remove hardcoded google-satellite from initial config to save bandwidth and keep it dynamic
old_config = """            'google-satellite': {
              type: 'raster',
              tiles: ['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'],
              tileSize: 256,
              maxzoom: 21,
              attribution: '© Google',
            }
          },
          layers: [
            {
              id: 'osm-background',
              type: 'raster',
              source: 'osm',
              minzoom: 0,
              maxzoom: 22,
              layout: { visibility: 'visible' },
            },
            {
              id: 'google-satellite-background',
              type: 'raster',
              source: 'google-satellite',
              minzoom: 0,
              maxzoom: 22,
              layout: { visibility: 'none' },
            }
          ],"""

new_config = """          },
          layers: [
            {
              id: 'osm-background',
              type: 'raster',
              source: 'osm',
              minzoom: 0,
              maxzoom: 22,
              layout: { visibility: 'visible' },
            }
          ],"""

content = content.replace(old_config, new_config)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'w') as f:
    f.write(content)
