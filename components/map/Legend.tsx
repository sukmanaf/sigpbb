'use client';

import { useContext } from 'react';
import { MapContext } from '@/components/providers/MapProvider';
import { LayerState } from '@/types/map';
import { getCategoryColor } from '@/lib/tematikColors';

const LEGEND_ITEMS: { key: keyof LayerState; label: string }[] = [
  { key: 'desas',     label: 'Desa/Kelurahan' },
  { key: 'bloks',     label: 'Blok' },
  { key: 'nops',      label: 'NOP' },
  { key: 'bangunans', label: 'Bangunan' },
];

const TEMATIK_LABELS: Record<string, string> = {
  'jenis_tanah': 'Jenis Tanah',
  'kelas_tanah': 'Kelas Tanah',
  'jenis_bangunan': 'Jenis Bangunan',
  'kelas_bangunan': 'Kelas Bangunan',
  'nilai_individu': 'Nilai Individu',
  'nik': 'Status NIK',
  'zona_nilai_tanah': 'ZNT',
  'ketetapan_per_buku': 'Ketetapan per Buku',
  'status_pembayaran': 'Status Pembayaran'
};

export function Legend() {
  const ctx = useContext(MapContext);
  if (!ctx) return null;

  const isUploadEnabled = process.env.NEXT_PUBLIC_FEATURE_UPLOAD_LAYER !== 'false';

  // Tematik Legend
  if (ctx.activeTematik && ctx.tematikData) {
    let categories = Object.keys(ctx.tematikData).sort();

    // If a block filter is active, only show categories that have items in that block
    if (ctx.activeBlokFilter) {
      categories = categories.filter((cat) => {
        const items = ctx.tematikData![cat];
        return items.some((item: any) => {
          const nop18 = item.NOP?.replace(/[.\-]/g, '');
          if (!nop18 || nop18.length < 13) return false;
          return nop18.substring(10, 13) === ctx.activeBlokFilter;
        });
      });
    }

    const activeLines = [
      { key: 'bloks' as const,     label: 'Blok' },
      { key: 'bangunans' as const, label: 'Bangunan' },
    ].filter((item) => ctx.layers[item.key]);

    if (categories.length === 0 && activeLines.length === 0) return null;

    return (
      <div className="legend-container pointer-events-auto bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg p-3 shadow-md min-w-[200px] max-w-[300px] max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
          Legenda {TEMATIK_LABELS[ctx.activeTematik!] || 'Tematik'}
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

        {/* Blok & Bangunan as line indicators at the bottom */}
        {activeLines.length > 0 && (
          <>
            <div className="mt-2 mb-1.5 border-t border-gray-200 pt-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Layer Aktif</span>
            </div>
            {activeLines.map((item) => (
              <div key={item.key} className="flex items-center gap-2 mb-1.5">
                {/* Line indicator */}
                <div className="w-5 shrink-0 flex items-center">
                  <div
                    className="w-full"
                    style={{
                      height: '2px',
                      backgroundColor: ctx.layerStyles[item.key].outlineColor,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-600 font-medium">{item.label}</span>
              </div>
            ))}
          </>
        )}

        {/* Uploaded Layers */}
        {isUploadEnabled && ctx.uploadedLayers && ctx.uploadedLayers.some(l => l.visible) && (
          <>
            <div className="mt-2 mb-1.5 border-t border-gray-200 pt-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Layer Tambahan</span>
            </div>
            {ctx.uploadedLayers.filter(l => l.visible).map((layer) => (
              <div key={layer.id} className="flex items-center gap-2 mb-1.5 last:mb-0">
                <div
                  className="w-3.5 h-3.5 rounded-sm shrink-0 border border-gray-300"
                  style={{ backgroundColor: layer.color }}
                />
                <span className="text-xs text-gray-600 font-medium max-w-[150px] truncate" title={layer.name}>{layer.name}</span>
              </div>
            ))}
          </>
        )}
      </div>
    );
  }

  // Normal Legend
  const activeLayers = LEGEND_ITEMS.filter((item) => ctx.layers[item.key]);
  const activeUploadedLayers = isUploadEnabled ? (ctx.uploadedLayers || []).filter(layer => layer.visible) : [];
  
  if (activeLayers.length === 0 && activeUploadedLayers.length === 0) return null;

  return (
    <div className="legend-container pointer-events-auto bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg p-3 shadow-md min-w-[150px]">
      <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Legenda</h4>
      
      {activeLayers.map((item) => (
        <div key={item.key} className="flex items-center gap-2 mb-1.5">
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

      {activeUploadedLayers.length > 0 && (
        <>
          {activeLayers.length > 0 && <div className="my-2 border-t border-gray-200" />}
          {activeUploadedLayers.map((layer) => (
            <div key={layer.id} className="flex items-center gap-2 mb-1.5 last:mb-0">
              <div
                className="w-4 h-2.5 rounded-sm shrink-0 border border-gray-300"
                style={{ 
                   backgroundColor: layer.color,
                   border: `1px solid ${layer.color}` 
                }}
              />
              <span className="text-xs text-gray-700 font-medium max-w-[150px] truncate" title={layer.name}>
                {layer.name}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
