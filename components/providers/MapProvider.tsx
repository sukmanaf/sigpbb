'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { LayerState, AppMode, LayerStyles } from '@/types/map';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MapInstance = any;

export const DEFAULT_LAYER_STYLES: LayerStyles = {
  desas:     { fillColor: '#10b981', fillOpacity: 20, outlineColor: '#10b981', outlineOpacity: 100 },
  nops:      { fillColor: '#f97316', fillOpacity: 40, outlineColor: '#ffffff', outlineOpacity: 80 },
  bloks:     { fillColor: '#ef4444', fillOpacity: 0,  outlineColor: '#ef4444', outlineOpacity: 100 },
  bangunans: { fillColor: '#7c3aed', fillOpacity: 60, outlineColor: '#7c3aed', outlineOpacity: 80 },
};

interface MapContextType {
  map: MapInstance | null;
  setMap: (map: MapInstance | null) => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  selectedDesa: string | null;
  setSelectedDesa: (desa: string | null) => void;
  selectedDesaName: string | null;
  setSelectedDesaName: (name: string | null) => void;
  selectedNop: string | null;
  setSelectedNop: (nop: string | null) => void;
  layers: LayerState;
  setLayers: (layers: LayerState) => void;
  layerStyles: LayerStyles;
  setLayerStyles: (styles: LayerStyles) => void;
  activeTematik: string | null;
  setActiveTematik: (t: string | null) => void;
  activeBlokFilter: string | null;
  setActiveBlokFilter: (b: string | null) => void;
  tematikData: Record<string, any[]> | null;
  setTematikData: (d: Record<string, any[]> | null) => void;
  tematikLoading: boolean;
  setTematikLoading: (l: boolean) => void;
  uploadedLayers: import('@/types/map').UploadedLayer[];
  setUploadedLayers: React.Dispatch<React.SetStateAction<import('@/types/map').UploadedLayer[]>>;
}

export const MapContext = createContext<MapContextType | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<MapInstance | null>(null);
  const [mode, setMode] = useState<AppMode>('view');
  const [selectedDesa, setSelectedDesa] = useState<string | null>(null);
  const [selectedDesaName, setSelectedDesaName] = useState<string | null>(null);
  const [selectedNop, setSelectedNop] = useState<string | null>(null);
  const [layers, setLayers] = useState<LayerState>({
    desas:     true,
    nops:      false,
    bloks:     false,
    bangunans: false,
  });
  const [layerStyles, setLayerStyles] = useState<LayerStyles>(DEFAULT_LAYER_STYLES);
  const [activeTematik, setActiveTematik] = useState<string | null>(null);
  const [activeBlokFilter, setActiveBlokFilter] = useState<string | null>(null);
  const [tematikData, setTematikData] = useState<Record<string, any[]> | null>(null);
  const [tematikLoading, setTematikLoading] = useState<boolean>(false);
  const [uploadedLayers, setUploadedLayers] = useState<import('@/types/map').UploadedLayer[]>([]);


// Load from LocalStorage on mount — deep merge with defaults so new fields always exist
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smartmap_layer_styles_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Deep-merge: start from defaults, override with saved values per layer
        const merged: LayerStyles = { ...DEFAULT_LAYER_STYLES };
        (Object.keys(DEFAULT_LAYER_STYLES) as (keyof LayerStyles)[]).forEach((key) => {
          if (parsed[key] && typeof parsed[key] === 'object') {
            merged[key] = { ...DEFAULT_LAYER_STYLES[key], ...parsed[key] };
          }
        });
        setLayerStyles(merged);
      }
    } catch (e) {
      console.error('Failed to load layer styles from cache', e);
    }
  }, []);

  // Save to LocalStorage whenever styles change
  useEffect(() => {
    localStorage.setItem('smartmap_layer_styles_v2', JSON.stringify(layerStyles));
  }, [layerStyles]);

  return (
    <MapContext.Provider
      value={{
        map,
        setMap,
        mode,
        setMode,
        selectedDesa,
        setSelectedDesa,
        selectedDesaName,
        setSelectedDesaName,
        selectedNop,
        setSelectedNop,
        layers,
        setLayers,
        layerStyles,
        setLayerStyles,
        activeTematik,
        setActiveTematik,
        activeBlokFilter,
        setActiveBlokFilter,
        tematikData,
        setTematikData,
        tematikLoading,
        setTematikLoading,
        uploadedLayers,
        setUploadedLayers,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}
