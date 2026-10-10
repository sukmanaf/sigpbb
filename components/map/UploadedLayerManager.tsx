'use client';

import { useContext, useEffect, useRef } from 'react';
import { MapContext } from '@/components/providers/MapProvider';

export function UploadedLayerManager() {
  const ctx = useContext(MapContext);
  const map = ctx?.map;
  const layers = ctx?.uploadedLayers || [];
  
  // Track currently added source IDs to diff changes
  const addedSources = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!map) return;

    const currentLayerIds = new Set(layers.map(l => l.id));

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
    layers.forEach(layer => {
      const sourceId = `ul-${layer.id}`;
      
      // Add source if not exists
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: layer.geojson
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
            layout: { visibility: layer.visible ? 'visible' : 'none' }
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
            layout: { visibility: layer.visible ? 'visible' : 'none' }
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
              'circle-stroke-color': '#ffffff'
            },
            layout: { visibility: layer.visible ? 'visible' : 'none' }
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

  }, [layers, map]);

  return null;
}

