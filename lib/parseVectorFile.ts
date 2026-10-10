import shp from 'shpjs';
import { kml, gpx } from '@tmcw/togeojson';

export async function parseVectorFile(file: File): Promise<GeoJSON.FeatureCollection | null> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  try {
    if (ext === 'geojson' || ext === 'json') {
      const text = await file.text();
      return JSON.parse(text) as GeoJSON.FeatureCollection;
    }

    if (ext === 'zip') {
      const buffer = await file.arrayBuffer();
      // shpjs can return FeatureCollection or FeatureCollection[]
      const geojson = await shp(buffer);
      if (Array.isArray(geojson)) {
        // Flatten multiple shapefiles in one zip into a single FeatureCollection
        return {
          type: 'FeatureCollection',
          features: geojson.flatMap((g) => g.features),
        };
      }
      return geojson as GeoJSON.FeatureCollection;
    }

    if (ext === 'kml' || ext === 'gpx') {
      const text = await file.text();
      const dom = new DOMParser().parseFromString(text, 'text/xml');
      if (ext === 'kml') {
        return kml(dom) as GeoJSON.FeatureCollection;
      } else {
        return gpx(dom) as GeoJSON.FeatureCollection;
      }
    }

    throw new Error('Unsupported file extension: ' + ext);
  } catch (err) {
    console.error('Error parsing vector file', err);
    throw err;
  }
}

export function detectGeometryType(geojson: GeoJSON.FeatureCollection): 'Point' | 'LineString' | 'Polygon' | 'Mixed' {
  const types = new Set<string>();
  
  for (const feature of geojson.features) {
    if (!feature.geometry) continue;
    const type = feature.geometry.type;
    
    if (type.includes('Point')) types.add('Point');
    else if (type.includes('LineString')) types.add('LineString');
    else if (type.includes('Polygon')) types.add('Polygon');
  }

  if (types.size === 0) return 'Mixed';
  if (types.size === 1) return Array.from(types)[0] as 'Point' | 'LineString' | 'Polygon';
  return 'Mixed';
}

