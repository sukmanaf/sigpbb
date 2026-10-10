'use client';

import { useEffect, useRef, useState, useContext } from 'react';
import { MapContext } from '@/components/providers/MapProvider';
import { BasemapSelector } from './BasemapSelector';

const LAYER_CONFIG = {
  desas:     { color: '#10b981', label: 'Desa/Kelurahan' },
  nops:      { color: '#f97316', label: 'NOP' },
  bloks:     { color: '#16a34a', label: 'Blok' },
  bangunans: { color: '#7c3aed', label: 'Bangunan' },
} as const;

type LayerName = keyof typeof LAYER_CONFIG;

const DESA_DEPENDENT: LayerName[] = ['nops', 'bloks', 'bangunans'];


export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const ctx = useContext(MapContext);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [basemap, setBasemap] = useState('osm');
  
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
      let isOfficial = false;
      
      if (sessionToken && apiKey) {
        tileUrl = `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${sessionToken}&key=${apiKey}`;
        isOfficial = true;
      }
      
      console.info(
        `%c [Basemap] %c ${mapType} %c ${isOfficial ? '✅ RESMI (API Key)' : '⚠️ GRATISAN (Bypass)'}`,
        'background: #10b981; color: white; border-radius: 4px; padding: 2px;',
        'font-weight: bold;',
        isOfficial ? 'color: #10b981; font-weight: bold;' : 'color: #f59e0b; font-weight: bold;'
      );

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
    } catch (err: any) {
      console.error('Failed to load Google basemap', err.message || err);
    }
  };

  const handleBasemapChange = async (id: string) => {
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
  };

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    import('maplibre-gl').then((maplibregl) => {
      if (cancelled || !containerRef.current) return;

      // maplibre-gl v4 has a default export
      const maplibre = (maplibregl as any).default ?? maplibregl;
      const { Map, NavigationControl, ScaleControl } = maplibre;

      // Load CSS
      if (!document.querySelector('link[data-maplibre]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
        link.setAttribute('data-maplibre', '1');
        document.head.appendChild(link);
      }

      const map = new Map({
        container: containerRef.current,
        preserveDrawingBuffer: true,
        clickTolerance: 15,
        style: {
          version: 8,
          glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
          sprite: 'https://openmaptiles.github.io/osm-bright-gl-style/sprite',
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              maxzoom: 19,
              attribution: '© OpenStreetMap contributors',
            },
          },
          layers: [
            {
              id: 'osm-background',
              type: 'raster',
              source: 'osm',
              minzoom: 0,
              maxzoom: 22,
              layout: { visibility: 'visible' },
            }
          ],
        },
        bounds: [[112.865, -7.675], [112.955, -7.605]], // Kota Pasuruan Bounding Box
        fitBoundsOptions: { padding: 20 },
        // Make relative tile URLs absolute so MapLibre web worker can fetch them
        transformRequest: (url: string) => {
          if (url.startsWith('/')) {
            return { url: `${window.location.origin}${url}` };
          }
          // Bust poisoned CORS cache from localhost:5173 (old Vite app)
          if (url.startsWith('http') && !url.includes('cb=1')) {
            const sep = url.includes('?') ? '&' : '?';
            return { url: `${url}${sep}cb=1` };
          }
          return { url };
        },
      });

      map.addControl(new NavigationControl(), 'top-left');
      map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left');

      map.on('load', () => {
        if (cancelled) return;

        // 1. Add Desas as GeoJSON Source
        map.addSource('desas', {
          type: 'geojson',
          data: '/api/desas',
        });

        // Desas Fill
        map.addLayer({
          id: 'desas-fill',
          type: 'fill',
          source: 'desas',
          paint: {
            'fill-color': LAYER_CONFIG.desas.color,
            'fill-opacity': 0.25,
            'fill-outline-color': LAYER_CONFIG.desas.color,
          },
          layout: { visibility: 'visible' },
        });

        // Desas Line
        map.addLayer({
          id: 'desas-line',
          type: 'line',
          source: 'desas',
          paint: {
            'line-color': LAYER_CONFIG.desas.color,
            'line-width': 1.5,
          },
          layout: { visibility: 'visible' },
        });

        // Desas Label
        map.addLayer({
          id: 'desas-label',
          type: 'symbol',
          source: 'desas',
          layout: {
            'text-field': ['get', 'd_nm_kel'],
            'text-size': 12,
            'text-anchor': 'center',
            visibility: 'visible',
          },
          paint: {
            'text-color': '#1e293b',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
          },
        });

        // 2. Add remaining dependent layers as MVT
        Object.entries(LAYER_CONFIG).forEach(([layerName, config]) => {
          if (layerName === 'desas') return; // Handled above

          const tileUrl = `/api/tiles/${layerName}/{z}/{x}/{y}?desa=__placeholder__`;

          map.addSource(layerName, {
            type: 'vector',
            tiles: [tileUrl],
            minzoom: 0,
            maxzoom: 22,
          });

          // Fill layer
          map.addLayer({
            id: `${layerName}-fill`,
            type: 'fill',
            source: layerName,
            'source-layer': layerName,
            paint: {
              'fill-color': config.color,
              'fill-opacity': layerName === 'nops' ? 0.6 : 0.4,
              'fill-outline-color': config.color,
            },
            layout: { visibility: 'none' },
          });

          // Line layer
          map.addLayer({
            id: `${layerName}-line`,
            type: 'line',
            source: layerName,
            'source-layer': layerName,
            paint: {
              'line-color': config.color,
              'line-width': layerName === 'nops' ? 0.5 : 1.5,
              'line-opacity': 0.8,
            },
            layout: { visibility: 'none' },
          });

          // Label layer (bloks & bangunans)
          if (layerName === 'bloks' || layerName === 'bangunans') {
            const textField = layerName === 'bloks' 
              ? ['slice', ['get', 'd_blok'], 10, 13] 
              : ['slice', ['get', 'd_nop'], 13, 17];
              
            const textColor = layerName === 'bloks' ? '#000000' : '#ffffff';
            const haloColor = layerName === 'bloks' ? '#ffffff' : '#000000';
            const textSize = layerName === 'bloks' ? 14 : 10;
            const haloWidth = layerName === 'bloks' ? 2 : 1;
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const labelConfig: any = {
              id: `${layerName}-label`,
              type: 'symbol',
              source: layerName,
              'source-layer': layerName,
              layout: {
                'text-field': textField,
                'text-size': textSize,
                'text-anchor': 'center',
                visibility: 'none',
              },
              paint: {
                'text-color': textColor,
                'text-halo-color': haloColor,
                'text-halo-width': haloWidth,
              },
            };

            if (layerName === 'bangunans') {
               labelConfig.minzoom = 16;
            }

            map.addLayer(labelConfig);
          }
        });

        // NOP label (only at high zoom)
        map.addLayer({
          id: 'nops-label',
          type: 'symbol',
          source: 'nops',
          'source-layer': 'nops',
          minzoom: 16,
          layout: {
            'text-field': ['slice', ['get', 'd_nop'], 13, 17],
            'text-size': 10,
            visibility: 'none',
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#000000',
            'text-halo-width': 1,
          },
        });

        // Cursor effects
        map.on('mouseenter', 'desas-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'desas-fill', () => { map.getCanvas().style.cursor = ''; });
        map.on('mouseenter', 'nops-fill',  () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'nops-fill',  () => { map.getCanvas().style.cursor = ''; });

        ctx?.setMap(map);
        setMapLoaded(true);
      });

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Click handlers (re-attached when mapLoaded or mode changes)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !ctx) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDesaClick = (e: any) => {
      if (!e.features?.[0] || ctx.mode !== 'view') return;

      const desaCode: string = e.features[0].properties.d_kd_kel;
      const desaName: string = e.features[0].properties.d_nm_kel;

      ctx.setSelectedDesa(desaCode);
      ctx.setSelectedDesaName(desaName);

      // Update tile URLs for desa-dependent layers
      DESA_DEPENDENT.forEach((layer) => {
        const source = map.getSource(layer);
        if (source?.setTiles) {
          source.setTiles([`/api/tiles/${layer}/{z}/{x}/{y}?desa=${desaCode}`]);
          if ((source as any).clearTiles) (source as any).clearTiles();
        }
      });

      // Layer state: hide desas, show nops
      const newLayers = { ...ctx.layers, desas: false, nops: true };
      ctx.setLayers(newLayers);
      
      // Reset Tematik state when a new Desa is selected
      if (ctx.activeTematik) {
         ctx.setActiveTematik(null);
      }

      const hide = ['desas-fill', 'desas-line', 'desas-label'];
      const show = ['nops-fill', 'nops-line', 'nops-label'];
      hide.forEach((id) => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', 'none'));
      show.forEach((id) => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', 'visible'));

      // Fly to desa bounding box
      const geom = e.features[0].geometry;
      const coords: [number, number][] =
        geom?.type === 'Polygon' ? geom.coordinates[0] :
        geom?.type === 'MultiPolygon' ? geom.coordinates[0][0] : [];

      if (coords.length > 0) {
        let minLng = coords[0][0], maxLng = coords[0][0];
        let minLat = coords[0][1], maxLat = coords[0][1];
        coords.forEach(([lng, lat]) => {
          minLng = Math.min(minLng, lng); maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
        });
        map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 50, maxZoom: 14 });
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleNopClick = (e: any) => {
      if (!e.features?.[0] || ctx.mode !== 'view') return;
      const nop: string = e.features[0].properties.d_nop;
      if (nop) ctx.setSelectedNop(nop);
    };

    // Desktop: standard MapLibre click events
    map.on('click', 'desas-fill', handleDesaClick);
    map.on('click', 'nops-fill', handleNopClick);

    // Mobile/Tablet: touchend on the canvas for reliable tap detection
    const canvas = map.getCanvas();
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length !== 1) return;
      const touch = e.changedTouches[0];
      const dx = Math.abs(touch.clientX - touchStartX);
      const dy = Math.abs(touch.clientY - touchStartY);
      const dt = Date.now() - touchStartTime;

      // Only treat as tap if: finger moved < 15px and held < 500ms
      if (dx > 15 || dy > 15 || dt > 500) return;

      const rect = canvas.getBoundingClientRect();
      const point = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };

      // Query desas layer first
      const desasFeatures = map.queryRenderedFeatures(point, { layers: ['desas-fill'] });
      if (desasFeatures.length > 0) {
        handleDesaClick({ features: desasFeatures });
        return;
      }

      // Then query nops layer
      const nopsFeatures = map.queryRenderedFeatures(point, { layers: ['nops-fill'] });
      if (nopsFeatures.length > 0) {
        handleNopClick({ features: nopsFeatures });
      }
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      map.off('click', 'desas-fill', handleDesaClick);
      map.off('click', 'nops-fill', handleNopClick);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, ctx?.mode]);



  // Update layer styles dynamically based on MapContext
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !ctx) return;
    const map = mapRef.current;
    
    if (ctx.layerStyles) {
      Object.entries(ctx.layerStyles).forEach(([layerKey, style]) => {
        const fillLayerId = `${layerKey}-fill`;
        const lineLayerId = `${layerKey}-line`;
        
try {
          if (map.getLayer(fillLayerId)) {
            if (!(layerKey === 'nops' && ctx.activeTematik)) {
               map.setPaintProperty(fillLayerId, "fill-color", style.fillColor);
            }
            map.setPaintProperty(fillLayerId, "fill-opacity", (style.fillOpacity ?? 30) / 100);
            map.setPaintProperty(fillLayerId, "fill-outline-color", style.outlineColor);
          }
          
          if (map.getLayer(lineLayerId)) {
            map.setPaintProperty(lineLayerId, "line-color", style.outlineColor);
            map.setPaintProperty(lineLayerId, "line-opacity", (style.outlineOpacity ?? 80) / 100);
          }
        } catch (err) {}
      });
    }

     if (ctx.layers) {
       Object.entries(ctx.layers).forEach(([layerKey, isVisible]) => {
          const visibility = isVisible ? "visible" : "none";
          const fillLayerId = `${layerKey}-fill`;
          const lineLayerId = `${layerKey}-line`;
          const labelLayerId = `${layerKey}-label`;
          
          if (map.getLayer(fillLayerId)) map.setLayoutProperty(fillLayerId, "visibility", visibility);
          if (map.getLayer(lineLayerId)) map.setLayoutProperty(lineLayerId, "visibility", visibility);
          if (map.getLayer(labelLayerId)) map.setLayoutProperty(labelLayerId, "visibility", visibility);
       });
    }
  }, [ctx?.layerStyles, ctx?.layers, mapLoaded]);

  // Update map filter based on activeBlokFilter
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !ctx) return;
    const map = mapRef.current;

    const applyFilter = (layerId: string, property: string) => {
      if (!map.getLayer(layerId)) return;
      if (ctx.activeBlokFilter) {
        map.setFilter(layerId, ['==', ['slice', ['get', property], 10, 13], ctx.activeBlokFilter]);
      } else {
        map.setFilter(layerId, null);
      }
    };

    ['nops-fill', 'nops-line', 'nops-label'].forEach(id => applyFilter(id, 'd_nop'));
    ['bangunans-fill', 'bangunans-line', 'bangunans-label'].forEach(id => applyFilter(id, 'd_nop'));
    ['bloks-fill', 'bloks-line', 'bloks-label'].forEach(id => applyFilter(id, 'd_blok'));

  }, [ctx?.activeBlokFilter, mapLoaded]);

  return (
    <>
      <div
        ref={containerRef}
        id="map-container"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      <div className="absolute bottom-8 right-4 z-10">
        <BasemapSelector currentBasemap={basemap} onBasemapChange={handleBasemapChange} />
      </div>
    </>
  );
}
