'use client';

import { useContext, useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MapContext } from '@/components/providers/MapProvider';
import {
  UploadedFeaturePopup,
  UploadedFeatureItem,
} from './UploadedFeaturePopup';

// Dynamic import helper for maplibre-gl to ensure SSR safety
let maplibreglModule: any = null;
async function getMaplibre() {
  if (!maplibreglModule) {
    const mod = await import('maplibre-gl');
    maplibreglModule = mod.default ?? mod;
  }
  return maplibreglModule;
}

const HIGHLIGHT_SOURCE = 'ul-popup-highlight';
const HIGHLIGHT_FILL = 'ul-popup-highlight-fill';
const HIGHLIGHT_LINE = 'ul-popup-highlight-line';
const HIGHLIGHT_POINT = 'ul-popup-highlight-point';

function isMapReady(map: any): boolean {
  if (!map) return false;
  try {
    if (map._removed) return false;
    return Boolean(map.style && typeof map.getSource === 'function');
  } catch {
    return false;
  }
}

function ensureHighlightLayers(map: any) {
  if (!isMapReady(map)) return;
  try {
    if (!map.getSource(HIGHLIGHT_SOURCE)) {
      map.addSource(HIGHLIGHT_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: HIGHLIGHT_FILL,
        type: 'fill',
        source: HIGHLIGHT_SOURCE,
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: {
          'fill-color': '#facc15',
          'fill-opacity': 0.45,
        },
      });

      map.addLayer({
        id: HIGHLIGHT_LINE,
        type: 'line',
        source: HIGHLIGHT_SOURCE,
        filter: ['any', ['==', ['geometry-type'], 'Polygon'], ['==', ['geometry-type'], 'LineString']],
        paint: {
          'line-color': '#d97706',
          'line-width': 3.5,
          'line-dasharray': [2, 1],
        },
      });

      map.addLayer({
        id: HIGHLIGHT_POINT,
        type: 'circle',
        source: HIGHLIGHT_SOURCE,
        filter: ['==', ['geometry-type'], 'Point'],
        paint: {
          'circle-color': '#facc15',
          'circle-radius': 9,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#d97706',
        },
      });
    }
  } catch {
    // Ignore error if map is tearing down
  }
}

function setHighlightFeature(map: any, feature: any) {
  if (!isMapReady(map)) return;
  try {
    ensureHighlightLayers(map);
    const source = map.getSource(HIGHLIGHT_SOURCE);
    if (source?.setData) {
      source.setData({
        type: 'FeatureCollection',
        features: feature?.geometry ? [{ type: 'Feature', properties: {}, geometry: feature.geometry }] : [],
      });
    }
  } catch {
    // Ignore error if map is tearing down
  }
}

function clearHighlight(map: any) {
  if (!isMapReady(map)) return;
  try {
    const source = map.getSource(HIGHLIGHT_SOURCE);
    if (source?.setData) {
      source.setData({
        type: 'FeatureCollection',
        features: [],
      });
    }
  } catch {
    // Ignore error if map is tearing down
  }
}

export function UploadedLayerManager() {
  const ctx = useContext(MapContext);
  const map = ctx?.map;
  const layers = ctx?.uploadedLayers || [];

  // Track currently added source IDs to diff changes
  const addedSources = useRef<Set<string>>(new Set());

  // Track active popup and React root
  const activePopupRef = useRef<any>(null);
  const activeRootRef = useRef<Root | null>(null);

  useEffect(() => {
    if (!isMapReady(map)) return;

    const currentLayerIds = new Set(layers.map((l) => l.id));

    // 1. Remove layers/sources that were deleted
    for (const sourceId of Array.from(addedSources.current)) {
      if (!currentLayerIds.has(sourceId)) {
        if (map.getLayer(`ul-${sourceId}-fill`)) map.removeLayer(`ul-${sourceId}-fill`);
        if (map.getLayer(`ul-${sourceId}-line`)) map.removeLayer(`ul-${sourceId}-line`);
        if (map.getLayer(`ul-${sourceId}-point`)) map.removeLayer(`ul-${sourceId}-point`);

        if (map.getSource(`ul-${sourceId}`)) {
          map.removeSource(`ul-${sourceId}`);
        }
        addedSources.current.delete(sourceId);
      }
    }

    // 2. Add or update existing layers
    layers.forEach((layer) => {
      const sourceId = `ul-${layer.id}`;

      // Add source if not exists
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: layer.geojson,
        });
        addedSources.current.add(layer.id);

        // Add style layers based on geometry type
        if (layer.type === 'Polygon' || layer.type === 'Mixed') {
          map.addLayer({
            id: `${sourceId}-fill`,
            type: 'fill',
            source: sourceId,
            filter: ['==', ['geometry-type'], 'Polygon'],
            paint: {
              'fill-color': layer.color,
              'fill-opacity': layer.opacity / 100,
            },
            layout: { visibility: layer.visible ? 'visible' : 'none' },
          });
        }

        if (layer.type === 'Polygon' || layer.type === 'LineString' || layer.type === 'Mixed') {
          map.addLayer({
            id: `${sourceId}-line`,
            type: 'line',
            source: sourceId,
            filter: ['any', ['==', ['geometry-type'], 'Polygon'], ['==', ['geometry-type'], 'LineString']],
            paint: {
              'line-color': layer.color,
              'line-width': 2,
              'line-opacity': 1, // outline always fully opaque
            },
            layout: { visibility: layer.visible ? 'visible' : 'none' },
          });
        }

        if (layer.type === 'Point' || layer.type === 'Mixed') {
          map.addLayer({
            id: `${sourceId}-point`,
            type: 'circle',
            source: sourceId,
            filter: ['==', ['geometry-type'], 'Point'],
            paint: {
              'circle-color': layer.color,
              'circle-radius': 5,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#ffffff',
            },
            layout: { visibility: layer.visible ? 'visible' : 'none' },
          });
        }
      } else {
        // Update existing layer visibility & color
        const visibility = layer.visible ? 'visible' : 'none';
        const opacity = layer.opacity / 100;

        if (map.getLayer(`${sourceId}-fill`)) {
          map.setLayoutProperty(`${sourceId}-fill`, 'visibility', visibility);
          map.setPaintProperty(`${sourceId}-fill`, 'fill-color', layer.color);
          map.setPaintProperty(`${sourceId}-fill`, 'fill-opacity', opacity);
        }

        if (map.getLayer(`${sourceId}-line`)) {
          map.setLayoutProperty(`${sourceId}-line`, 'visibility', visibility);
          map.setPaintProperty(`${sourceId}-line`, 'line-color', layer.color);
        }

        if (map.getLayer(`${sourceId}-point`)) {
          map.setLayoutProperty(`${sourceId}-point`, 'visibility', visibility);
          map.setPaintProperty(`${sourceId}-point`, 'circle-color', layer.color);
        }
      }
    });

    // 3. Reorder layers on the map to match `layers` array:
    // First, position uploaded polygon fills according to uploaded layers list (bottom to top):
    const reversed = [...layers].reverse();
    reversed.forEach((layer) => {
      const sourceId = `ul-${layer.id}`;
      if (map.getLayer(`${sourceId}-fill`)) map.moveLayer(`${sourceId}-fill`);
    });

    // Keep NOP, Blok, and Bangunan layers ON TOP of uploaded fills so parcels, boundaries, and buildings remain visible!
    const baseLayersOnTop = [
      'nops-fill', 'nops-line', 'nops-label',
      'bloks-fill', 'bloks-line', 'bloks-label',
      'bangunans-fill', 'bangunans-line', 'bangunans-label'
    ];
    baseLayersOnTop.forEach((layerId) => {
      if (map.getLayer(layerId)) map.moveLayer(layerId);
    });

    // Then move uploaded lines and points on top so user's lines and markers remain clearly visible:
    reversed.forEach((layer) => {
      const sourceId = `ul-${layer.id}`;
      if (map.getLayer(`${sourceId}-line`)) map.moveLayer(`${sourceId}-line`);
      if (map.getLayer(`${sourceId}-point`)) map.moveLayer(`${sourceId}-point`);
    });

    // Ensure highlight layers remain above all uploaded layers
    if (map.getLayer(HIGHLIGHT_FILL)) map.moveLayer(HIGHLIGHT_FILL);
    if (map.getLayer(HIGHLIGHT_LINE)) map.moveLayer(HIGHLIGHT_LINE);
    if (map.getLayer(HIGHLIGHT_POINT)) map.moveLayer(HIGHLIGHT_POINT);

    // Ensure MapboxDraw interactive layers remain on top if present
    const currentStyle = map.getStyle();
    if (currentStyle?.layers) {
      currentStyle.layers.forEach((l: any) => {
        if (l.id && l.id.startsWith('gl-draw-') && map.getLayer(l.id)) {
          map.moveLayer(l.id);
        }
      });
    }

    // 4. Setup click & hover handlers for uploaded layers
    const getVisibleUploadedStyleLayerIds = () => {
      const ids: string[] = [];
      layers.forEach((layer) => {
        if (layer.visible) {
          const s = `ul-${layer.id}`;
          if (map.getLayer(`${s}-point`)) ids.push(`${s}-point`);
          if (map.getLayer(`${s}-line`)) ids.push(`${s}-line`);
          if (map.getLayer(`${s}-fill`)) ids.push(`${s}-fill`);
        }
      });
      return ids;
    };

    const handleMapClick = async (e: any) => {
      if (!map || ctx?.mode !== 'view') return;

      // In city view (no desa selected), if user clicked on a desa polygon, let handleDesaClick select it!
      if (!ctx?.selectedDesa) {
        const desasFeatures = map.queryRenderedFeatures(e.point, { layers: ['desas-fill'] });
        if (desasFeatures && desasFeatures.length > 0) {
          return;
        }
      }

      const visibleLayerIds = getVisibleUploadedStyleLayerIds();
      if (visibleLayerIds.length === 0) return;

      // Query features under click location
      const renderedFeatures = map.queryRenderedFeatures(e.point, {
        layers: visibleLayerIds,
      });

      if (!renderedFeatures || renderedFeatures.length === 0) return;

      // Inside a desa, if user clicked a NOP and only uploaded polygon fill is present, let NOP detail take priority
      const hasUploadedPointOrLine = renderedFeatures.some((f: any) =>
        f.geometry?.type === 'Point' || f.geometry?.type === 'LineString' || f.geometry?.type === 'MultiLineString'
      );
      if (ctx?.selectedDesa && !hasUploadedPointOrLine) {
        const nopsFeatures = map.queryRenderedFeatures(e.point, { layers: ['nops-fill'] });
        if (nopsFeatures && nopsFeatures.length > 0) {
          return;
        }
      }

      // Deduplicate features (e.g. fill and line from the same polygon)
      const seenKeys = new Set<string>();
      const clickedItems: UploadedFeatureItem[] = [];

      for (const feat of renderedFeatures) {
        const sourceName = feat.layer?.source || feat.source || '';
        const layerId = sourceName.replace(/^ul-/, '');
        const parentLayer = layers.find((l) => l.id === layerId);

        if (!parentLayer || !parentLayer.visible) continue;

        const props = feat.properties || {};
        // Unique feature key based on layerId, feature id/properties, and geometry
        const dedupeKey = `${parentLayer.id}_${feat.id ?? ''}_${JSON.stringify(props)}_${feat.geometry?.type}`;

        if (seenKeys.has(dedupeKey)) continue;
        seenKeys.add(dedupeKey);

        clickedItems.push({
          id: `${parentLayer.id}_${clickedItems.length}_${Date.now()}`,
          layerId: parentLayer.id,
          layerName: parentLayer.name,
          layerColor: parentLayer.color,
          geometryType: feat.geometry?.type || parentLayer.type || 'Polygon',
          properties: props,
          geometry: feat.geometry,
        });
      }

      if (clickedItems.length === 0) return;

      // Close previous popup if any
      if (activePopupRef.current) {
        activePopupRef.current.remove();
        activePopupRef.current = null;
      }
      if (activeRootRef.current) {
        activeRootRef.current.unmount();
        activeRootRef.current = null;
      }

      // Initialize MapLibre popup
      const maplibre = await getMaplibre();
      const popupContainer = document.createElement('div');
      const root = createRoot(popupContainer);
      activeRootRef.current = root;

      const popup = new maplibre.Popup({
        closeButton: false, // Custom close button rendered inside React component
        closeOnClick: true,
        maxWidth: '380px',
        className: 'uploaded-layer-popup',
      })
        .setLngLat(e.lngLat)
        .setDOMContent(popupContainer)
        .addTo(map);

      activePopupRef.current = popup;

      // Highlight the first feature on the map
      setHighlightFeature(map, clickedItems[0]);

      const closePopup = () => {
        popup.remove();
      };

      root.render(
        <UploadedFeaturePopup
          features={clickedItems}
          initialIndex={0}
          initialViewMode="single"
          onSelectFeature={(selectedFeat) => {
            setHighlightFeature(map, selectedFeat);
          }}
          onClose={closePopup}
        />
      );

      popup.on('close', () => {
        clearHighlight(map);
        activePopupRef.current = null;
        setTimeout(() => {
          if (activeRootRef.current === root) {
            root.unmount();
            activeRootRef.current = null;
          }
        }, 0);
      });
    };

    map.on('click', handleMapClick);

    // Hover cursor pointer handlers
    const onMouseEnter = () => {
      if (ctx?.mode === 'view') {
        map.getCanvas().style.cursor = 'pointer';
      }
    };
    const onMouseLeave = () => {
      if (ctx?.mode === 'view') {
        map.getCanvas().style.cursor = '';
      }
    };

    const registeredLayerIds = getVisibleUploadedStyleLayerIds();
    registeredLayerIds.forEach((id) => {
      map.on('mouseenter', id, onMouseEnter);
      map.on('mouseleave', id, onMouseLeave);
    });

    return () => {
      try {
        if (isMapReady(map)) {
          map.off('click', handleMapClick);
          registeredLayerIds.forEach((id) => {
            map.off('mouseenter', id, onMouseEnter);
            map.off('mouseleave', id, onMouseLeave);
          });
        }
      } catch {
        // Silently ignore during teardown
      }
    };
  }, [layers, map, ctx?.mode, ctx?.selectedDesa]);

  // Close popup and clear highlight when selected desa changes
  useEffect(() => {
    if (activePopupRef.current) {
      try { activePopupRef.current.remove(); } catch {}
      activePopupRef.current = null;
    }
    if (activeRootRef.current) {
      try { activeRootRef.current.unmount(); } catch {}
      activeRootRef.current = null;
    }
    clearHighlight(map);
  }, [ctx?.selectedDesa, map]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activePopupRef.current) {
        try { activePopupRef.current.remove(); } catch {}
        activePopupRef.current = null;
      }
      if (activeRootRef.current) {
        try { activeRootRef.current.unmount(); } catch {}
        activeRootRef.current = null;
      }
      clearHighlight(map);
    };
  }, [map]);

  return null;
}
