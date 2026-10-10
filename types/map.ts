export interface LayerState {
  desas: boolean;
  nops: boolean;
  bloks: boolean;
  bangunans: boolean;
}

export interface LayerStyle {
  fillColor: string;
  fillOpacity: number;
  outlineColor: string;
  outlineOpacity: number;
}

export type LayerStyles = Record<keyof LayerState, LayerStyle>;

export interface NopDetail {
  id: number;
  d_nop: string;
  d_luas: number;
  d_kd_kel: string;
  d_nm_kel: string;
  d_blok?: string;
  bangunan?: BuildingInfo[];
  pbb?: any;
}

export interface BuildingInfo {
  id: number;
  geom?: string;
}

export interface DesaInfo {
  id: number;
  d_kd_kel: string;
  d_nm_kel: string;
}

export type AppMode = 'view' | 'edit' | 'fast-edit' | 'bulk-edit';

export interface SearchResult {
  type: 'nop' | 'desa' | 'blok';
  id: string;
  label: string;
  sublabel?: string;
}

export interface UploadedLayer {
  id: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geojson: any;
  color: string;
  opacity: number;
  visible: boolean;
  type: 'Point' | 'LineString' | 'Polygon' | 'Mixed';
}
