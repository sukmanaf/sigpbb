'use client';

import { useState } from 'react';
import { Layers } from 'lucide-react';

export const BASEMAPS = [
  {
    id: 'osm',
    name: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap',
  },
  {
    id: 'google-roadmap',
    name: 'Google Peta',
    url: '', // Fetched dynamically in MapView
    attribution: '© Google',
  },
  {
    id: 'google-satellite',
    name: 'Google Satelit',
    url: '', // Fetched dynamically in MapView
    attribution: '© Google',
  },
  {
    id: 'google-hybrid',
    name: 'Google Hybrid',
    url: '', // Fetched dynamically in MapView
    attribution: '© Google',
  },
  {
    id: 'google-terrain',
    name: 'Google Terrain',
    url: '', // Fetched dynamically in MapView
    attribution: '© Google',
  },
];

interface BasemapSelectorProps {
  currentBasemap: string;
  onBasemapChange: (id: string) => void;
}

export function BasemapSelector({ currentBasemap, onBasemapChange }: BasemapSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition-colors border border-gray-200"
        title="Ubah Basemap"
      >
        <Layers size={20} />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 min-w-[180px] overflow-hidden z-50">
          <div className="px-3 py-2 bg-emerald-50 border-b border-emerald-100">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Basemap</span>
          </div>
          <div className="flex flex-col">
            {BASEMAPS.map((basemap) => (
              <button
                key={basemap.id}
                onClick={() => {
                  onBasemapChange(basemap.id);
                  setOpen(false);
                }}
                className={`text-left px-4 py-3 text-sm transition-colors border-b border-gray-50 last:border-0 ${
                  currentBasemap === basemap.id
                    ? 'bg-emerald-500 text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {basemap.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
