// GeoJSON types inline (no external package needed)
interface GeoJSONGeometry {
  type: string;
  coordinates: unknown;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success?: boolean;
}

export interface TileParams {
  layer: string;
  z: number;
  x: number;
  y: number;
  desaCode?: string;
}

export interface CreateNopRequest {
  geometry: GeoJSONGeometry;
  properties: {
    d_kd_kel: string;
    d_nop?: string;
    d_luas?: number;
  };
}

export interface UpdateNopRequest {
  geometry: GeoJSONGeometry;
  properties: {
    id?: number;
    d_kd_kel?: string;
    d_luas?: number;
  };
}
