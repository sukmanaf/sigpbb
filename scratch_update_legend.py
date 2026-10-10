import re

with open('/home/wgipro/koding/newmap/my-app/components/map/Legend.tsx', 'r') as f:
    content = f.read()

replacement = """'use client';

import { useContext } from 'react';
import { MapContext } from '@/components/providers/MapProvider';
import { LayerState } from '@/types/map';
import { getCategoryColor } from '@/lib/tematikColors';

const LEGEND_ITEMS: { key: keyof LayerState; label: string }[] = [
  { key: 'desas',     label: 'Desa/Kelurahan' },
  { key: 'bloks',     label: 'Blok' },
  { key: 'nops',      label: 'NOP (Parcel)' },
  { key: 'bangunans', label: 'Bangunan' },
];

export function Legend() {
  const ctx = useContext(MapContext);
  if (!ctx) return null;

  // Tematik Legend
  if (ctx.activeTematik && ctx.tematikData) {
    const categories = Object.keys(ctx.tematikData).sort();
    
    return (
      <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg p-3 shadow-md min-w-[200px] max-w-[300px] max-h-[300px] overflow-y-auto">
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
          Legenda Tematik
        </h4>
        {categories.map((cat) => {
          const color = getCategoryColor(cat, ctx.activeTematik!);
          return (
            <div key={cat} className="flex items-start gap-2 mb-1.5 last:mb-0">
              <div
                className="w-3.5 h-3.5 rounded-sm shrink-0 mt-0.5 border border-gray-300"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-700 font-medium leading-snug">{cat}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Normal Legend
  const activeLayers = LEGEND_ITEMS.filter((item) => ctx.layers[item.key]);
  if (activeLayers.length === 0) return null;

  return (
    <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg p-3 shadow-md min-w-[150px]">
      <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Legenda</h4>
      {activeLayers.map((item) => (
        <div key={item.key} className="flex items-center gap-2 mb-1.5 last:mb-0">
          <div
            className="w-4 h-2.5 rounded-sm shrink-0 border border-gray-300"
            style={{ 
               backgroundColor: ctx.layerStyles[item.key].fillColor,
               border: `1px solid ${ctx.layerStyles[item.key].outlineColor}` 
            }}
          />
          <span className="text-xs text-gray-700 font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
"""

with open('/home/wgipro/koding/newmap/my-app/components/map/Legend.tsx', 'w') as f:
    f.write(replacement)
