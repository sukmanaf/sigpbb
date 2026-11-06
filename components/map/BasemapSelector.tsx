'use client';

import { useState } from 'react';
import { Layers, Check, ShieldCheck, Zap } from 'lucide-react';

export interface BasemapItem {
  id: string;
  name: string;
  category: 'gratis' | 'official';
  badge: string;
  description: string;
  attribution: string;
}

export const BASEMAPS: BasemapItem[] = [
  // 1. Kategori Bebas Kuota (Gratis / Bypass)
  {
    id: 'osm',
    name: 'OpenStreetMap',
    category: 'gratis',
    badge: 'Bebas Kuota',
    description: 'Peta global open-source',
    attribution: '© OpenStreetMap',
  },
  {
    id: 'google-roadmap',
    name: 'Google Peta ',
    category: 'gratis',
    badge: 'Bebas Kuota',
    description: 'Peta jalan Google tanpa batas kuota',
    attribution: '© Google',
  },
  {
    id: 'google-satellite',
    name: 'Google Satelit ',
    category: 'gratis',
    badge: 'Bebas Kuota',
    description: 'Citra satelit Google tanpa kuota',
    attribution: '© Google',
  },
  {
    id: 'google-hybrid',
    name: 'Google Hybrid ',
    category: 'gratis',
    badge: 'Bebas Kuota',
    description: 'Satelit + nama jalan Google',
    attribution: '© Google',
  },
  {
    id: 'google-terrain',
    name: 'Google Terrain ',
    category: 'gratis',
    badge: 'Bebas Kuota',
    description: 'Topografi & kontur elevasi',
    attribution: '© Google',
  },

  // 2. Kategori Resmi (Google Maps API Key)
  {
    id: 'google-official-roadmap',
    name: 'Google Peta (API Key)',
    category: 'official',
    badge: 'Official Key',
    description: 'Google Map Tiles API resmi',
    attribution: '© Google Cloud',
  },
  {
    id: 'google-official-satellite',
    name: 'Google Satelit (API Key)',
    category: 'official',
    badge: 'Official Key',
    description: 'Google 2D Tiles API satelit resmi',
    attribution: '© Google Cloud',
  },
  {
    id: 'google-official-hybrid',
    name: 'Google Hybrid (API Key)',
    category: 'official',
    badge: 'Official Key',
    description: 'Google 2D Tiles API hybrid resmi',
    attribution: '© Google Cloud',
  },
  {
    id: 'google-official-terrain',
    name: 'Google Terrain (API Key)',
    category: 'official',
    badge: 'Official Key',
    description: 'Google 2D Tiles API terrain resmi',
    attribution: '© Google Cloud',
  },
];

interface BasemapSelectorProps {
  currentBasemap: string;
  onBasemapChange: (id: string) => void;
}

export function BasemapSelector({ currentBasemap, onBasemapChange }: BasemapSelectorProps) {
  const [open, setOpen] = useState(false);

  const gratisBasemaps = BASEMAPS.filter((b) => b.category === 'gratis');
  const officialBasemaps = BASEMAPS.filter((b) => b.category === 'official');

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition-colors border border-gray-200 cursor-pointer"
        title="Pilih Jenis Basemap"
      >
        <Layers size={20} />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 w-72 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers size={15} />
              <span className="text-xs font-bold tracking-wide uppercase">Pilihan Basemap</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
              {BASEMAPS.length} Opsi
            </span>
          </div>

          <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100">
            {/* Section 1: Bebas Kuota / Gratisan */}
            <div className="p-2 bg-gray-50/50">
              <div className="space-y-0.5">
                {gratisBasemaps.map((b) => {
                  const isActive = currentBasemap === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        onBasemapChange(b.id);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                          : 'text-gray-700 hover:bg-emerald-50/70 hover:text-emerald-900'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="truncate leading-tight">{b.name}</p>
                        <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-emerald-100' : 'text-gray-400'}`}>
                          {b.description}
                        </p>
                      </div>
                      {isActive && <Check size={14} className="shrink-0 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Resmi Google (Menggunakan API Key) */}
            <div className="p-2 bg-amber-50/20">
              <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-amber-900 bg-amber-100/80 rounded mb-1.5 border border-amber-200/60">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-amber-700" />
                  Resmi (Google API Key)
                </span>
                <span className="text-[9px] font-medium text-amber-800 bg-white/80 px-1.5 py-0.5 rounded">
                  Cloud API
                </span>
              </div>
              <div className="space-y-0.5">
                {officialBasemaps.map((b) => {
                  const isActive = currentBasemap === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        onBasemapChange(b.id);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-amber-600 text-white font-semibold shadow-xs'
                          : 'text-gray-700 hover:bg-amber-50/70 hover:text-amber-950'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="truncate leading-tight">{b.name}</p>
                        <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-amber-100' : 'text-gray-400'}`}>
                          {b.description}
                        </p>
                      </div>
                      {isActive && <Check size={14} className="shrink-0 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
