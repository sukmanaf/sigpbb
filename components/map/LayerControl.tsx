'use client';

import Swal from 'sweetalert2';
import { useContext, useState } from 'react';
import { MapContext, DEFAULT_LAYER_STYLES, MapContextType } from '@/components/providers/MapProvider';
import { LayerState, LayerStyle } from '@/types/map';
import { Layers, Palette, RotateCcw, Eye, EyeOff, GripVertical, ChevronUp, ChevronDown, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ExportLayerModal } from './ExportLayerModal';

const LAYER_LABELS: Record<keyof LayerState, string> = {
  desas:     'Desa',
  nops:      'NOP',
  bloks:     'Blok',
  bangunans: 'Bangunan',
};

// When tematik is active, only NOP is hidden (replaced by Tematik row)
const TEMATIK_HIDDEN: (keyof LayerState)[] = ['nops'];
const DESA_DEPENDENT: (keyof LayerState)[] = ['nops', 'bloks', 'bangunans'];

function getGeoJSONBBox(geojson: any): [number, number, number, number] | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let hasCoords = false;

  function extractCoords(coords: any[]) {
    if (!coords || !coords.length) return;
    if (typeof coords[0] === 'number') {
      const x = coords[0];
      const y = coords[1];
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      hasCoords = true;
    } else {
      coords.forEach(extractCoords);
    }
  }

  if (geojson?.type === 'FeatureCollection') {
    geojson.features.forEach((f: any) => {
      if (f.geometry?.coordinates) extractCoords(f.geometry.coordinates);
    });
  } else if (geojson?.type === 'Feature') {
    if (geojson.geometry?.coordinates) extractCoords(geojson.geometry.coordinates);
  } else if (geojson?.coordinates) {
    extractCoords(geojson.coordinates);
  }

  return hasCoords ? [minX, minY, maxX, maxY] : null;
}

/** Tematik outline style row — only allows editing outline color + opacity */
function TematikLayerRow({
  ctx,
}: {
  ctx: MapContextType;
}) {
  const [expanded, setExpanded] = useState(false);
  const { map, layers, setLayers, layerStyles, setLayerStyles, activeTematik } = ctx;
  const isVisible = layers.nops;

  const style = layerStyles.nops;

  const toggleVisible = () => {
    if (!map) return;
    const newLayers = { ...layers, nops: !isVisible };
    setLayers(newLayers);
  };

  const updateOutline = (updates: Partial<LayerStyle>) => {
    setLayerStyles({ ...layerStyles, nops: { ...layerStyles.nops, ...updates } });
  };

  const tematikName = activeTematik ? activeTematik.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Tematik';

  return (
    <div className={`border rounded-lg transition-all ${expanded ? 'border-teal-200 shadow-sm' : 'border-teal-100 hover:border-teal-200'}`}>
      {/* Header */}
      <div className={`flex items-center p-3 gap-3 ${expanded ? 'rounded-t-lg bg-teal-50/50' : 'rounded-lg bg-white'}`}>
        {/* Color dot — shows outline color since fill is driven by data */}
        <div
          className="w-3.5 h-3.5 rounded-full flex-shrink-0 bg-white"
          style={{ border: `3px solid ${style.outlineColor}` }}
        />

        {/* Visibility toggle */}
        <button
          onClick={toggleVisible}
          className={`p-1.5 rounded-md transition-colors ${
            isVisible ? 'bg-teal-100 text-teal-600 hover:bg-teal-200' : 'text-gray-400 hover:bg-gray-100'
          }`}
          title={isVisible ? 'Sembunyikan Tematik' : 'Tampilkan Tematik'}
        >
          {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>

        {/* Label */}
        <span className="text-sm flex-1 text-teal-700 font-semibold">{tematikName}</span>

        {/* Zoom Toggle */}
        <button
          onClick={() => {
            if (!map) return;
            if (ctx.selectedDesa) {
              const features = map.querySourceFeatures('desas', { sourceLayer: 'desas', filter: ['==', 'd_kd_kel', ctx.selectedDesa] });
              if (features && features.length > 0) {
                const fc = { type: 'FeatureCollection', features: features.map((f: any) => f.toJSON()) };
                const bbox = getGeoJSONBBox(fc);
                if (bbox) {
                  map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 50, duration: 1500 });
                  return;
                }
              }
            }
            map.fitBounds([[112.865, -7.675], [112.955, -7.605]], { padding: 50, duration: 1500 });
          }}
          className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title="Zoom ke Layer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
        </button>

        {/* Palette toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`p-1.5 rounded-md transition-colors ${
            expanded ? 'bg-teal-100 text-teal-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          }`}
          title="Edit Style Garis Tepi"
        >
          <Palette size={16} />
        </button>
      </div>

      {/* Style editor — outline only */}
      {expanded && (
        <div className="p-4 border-t border-teal-50 bg-white space-y-4">
          <p className="text-xs text-gray-400 italic">Warna isi ditentukan oleh data tematik. Anda hanya dapat mengatur garis tepi.</p>

          {/* Outline Color */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded border border-gray-300 overflow-hidden cursor-pointer shadow-sm shrink-0">
                <input
                  type="color"
                  value={style.outlineColor}
                  onChange={(e) => updateOutline({ outlineColor: e.target.value })}
                  className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">Garis Tepi</span>
            </div>
            <input
              type="text"
              value={style.outlineColor.toUpperCase()}
              onChange={(e) => {
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                  updateOutline({ outlineColor: e.target.value });
                }
              }}
              className="w-20 text-xs px-2 py-1.5 bg-gray-50 border border-gray-200 rounded font-mono text-gray-600 focus:outline-none focus:border-teal-500"
              maxLength={7}
            />
          </div>

          {/* Outline Opacity */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-500 font-medium">Opacity</span>
            <div className="flex-1 flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={style.outlineOpacity ?? 80}
                onChange={(e) => updateOutline({ outlineOpacity: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <span className="text-xs text-gray-600 w-8 text-right font-medium">{style.outlineOpacity ?? 80}%</span>
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={() => updateOutline({ outlineColor: DEFAULT_LAYER_STYLES.nops.outlineColor, outlineOpacity: DEFAULT_LAYER_STYLES.nops.outlineOpacity })}
            className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
          >
            <RotateCcw size={13} />
            Reset ke Default
          </button>
        </div>
      )}
    </div>
  );
}

export function LayerControl({ onClose }: { onClose?: () => void }) {
  const ctx = useContext(MapContext);
  const { canExport } = useAuth();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [expandedLayer, setExpandedLayer] = useState<keyof LayerState | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const isUploadEnabled = process.env.NEXT_PUBLIC_FEATURE_UPLOAD_LAYER !== 'false';

  if (!ctx) return null;

  const { map, layers, setLayers, selectedDesa, layerStyles, setLayerStyles, activeTematik } = ctx;

  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || !ctx.uploadedLayers) return;
    const newLayers = [...ctx.uploadedLayers];
    const [moved] = newLayers.splice(fromIndex, 1);
    newLayers.splice(toIndex, 0, moved);
    ctx.setUploadedLayers(newLayers);
  };

  const moveLayerUp = (index: number) => {
    if (index > 0) handleReorder(index, index - 1);
  };

  const moveLayerDown = (index: number) => {
    if (ctx.uploadedLayers && index < ctx.uploadedLayers.length - 1) {
      handleReorder(index, index + 1);
    }
  };

  const toggleLayer = (layerKey: keyof LayerState) => {
    if (!map) return;

    if (DESA_DEPENDENT.includes(layerKey) && !selectedDesa && !layers[layerKey]) {
      Swal.fire('Perhatian!', 'Pilih desa terlebih dahulu dengan mengklik polygon desa di peta', 'warning');
      return;
    }

    const newLayers = { ...layers };
    newLayers[layerKey] = !newLayers[layerKey];

    // If turning ON the Desa layer, auto-hide detailed layers, reset Tematik, and zoom out
    if (layerKey === 'desas' && newLayers.desas === true) {
      newLayers.nops = false;
      newLayers.bloks = false;
      newLayers.bangunans = false;

      if (ctx.activeTematik) {
        ctx.setActiveTematik(null);
      }

      ctx.setSelectedDesa(null);
      ctx.setSelectedDesaName(null);

      if (map) {
        map.flyTo({
          center: [112.935, -7.64],
          zoom: 12.5,
          duration: 1500,
        });
      }
    }

    setLayers(newLayers);
  };

  const updateStyle = (layerKey: keyof LayerState, updates: Partial<LayerStyle>) => {
    setLayerStyles({
      ...layerStyles,
      [layerKey]: { ...layerStyles[layerKey], ...updates },
    });
  };

  const resetStyle = (layerKey: keyof LayerState) => {
    setLayerStyles({
      ...layerStyles,
      [layerKey]: DEFAULT_LAYER_STYLES[layerKey],
    });
  };

  const handleZoomToLayer = (layerKey: keyof LayerState) => {
    if (!map) return;
    
    if (DESA_DEPENDENT.includes(layerKey) && selectedDesa) {
      // Try to get bounds from currently loaded source features
      const features = map.querySourceFeatures('desas', { sourceLayer: 'desas', filter: ['==', 'd_kd_kel', selectedDesa] });
      if (features && features.length > 0) {
        const fc = { type: 'FeatureCollection', features: features.map((f: any) => f.toJSON()) };
        const bbox = getGeoJSONBBox(fc);
        if (bbox) {
          map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 50, duration: 1500 });
          return;
        }
      }
    }
    
    // Default Pasuruan bounds for desas layer or if selectedDesa bounds not found
    map.fitBounds([[112.865, -7.675], [112.955, -7.605]], { padding: 50, duration: 1500 });
  };

  // When tematik is active, hide nops/bloks/bangunans from normal list
  const visibleKeys = (Object.keys(LAYER_LABELS) as (keyof LayerState)[]).filter(
    (key) => !(activeTematik && TEMATIK_HIDDEN.includes(key))
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 w-[320px] pointer-events-auto">
      {/* Header */}
      <div className="bg-emerald-600 px-4 py-3 flex items-center justify-between rounded-t-xl">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Layers size={18} />
          Layer Control
        </h3>
        {canExport && (
          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
            title="Export Layer Default"
          >
            <Download size={13} />
            <span>Export</span>
          </button>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Normal layers (filtered when tematik active) */}
        {visibleKeys.map((key) => {
          const isDependent = DESA_DEPENDENT.includes(key);
          const isDisabled = isDependent && !selectedDesa;
          const isExpanded = expandedLayer === key;
          const style = layerStyles[key];
          const isVisible = layers[key];

          return (
            <div
              key={key}
              className={`border rounded-lg transition-all ${
                isExpanded ? 'border-emerald-200 shadow-sm' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {/* Header Row */}
              <div
                className={`flex items-center p-3 gap-3 ${isExpanded ? 'rounded-t-lg bg-emerald-50/50' : 'rounded-lg bg-white'}`}
              >
                {/* Color Dot */}
                <div
                  className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${isDisabled ? 'grayscale opacity-50' : ''}`}
                  style={{ backgroundColor: style.fillColor, border: `2px solid ${style.outlineColor}` }}
                />

                {/* Visibility Toggle */}
                <button
                  onClick={() => toggleLayer(key)}
                  disabled={isDisabled}
                  className={`p-1.5 rounded-md transition-colors ${
                    isDisabled
                      ? 'opacity-30 cursor-not-allowed'
                      : isVisible
                      ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  title={isVisible ? 'Sembunyikan Layer' : 'Tampilkan Layer'}
                >
                  {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>

                {/* Label */}
                <span className={`text-sm flex-1 ${isDisabled ? 'text-gray-400' : 'text-gray-700 font-medium'}`}>
                  {LAYER_LABELS[key]}
                </span>

                {/* Zoom Toggle */}
                <button
                  onClick={() => handleZoomToLayer(key)}
                  disabled={isDisabled}
                  className={`p-1.5 rounded-md transition-colors ${
                    isDisabled ? 'opacity-30 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                  title="Zoom ke Layer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                </button>

                {/* Palette Toggle */}
                <button
                  onClick={() => setExpandedLayer(isExpanded ? null : key)}
                  disabled={isDisabled}
                  className={`p-1.5 rounded-md transition-colors ${
                    isDisabled
                      ? 'opacity-30 cursor-not-allowed'
                      : isExpanded
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  }`}
                  title="Edit Style"
                >
                  <Palette size={16} />
                </button>
              </div>

              {/* Expanded Style Editor */}
              {isExpanded && !isDisabled && (
                <div className="p-4 border-t border-emerald-50 bg-white space-y-4">
                  {/* Fill Color */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded border border-gray-300 overflow-hidden cursor-pointer shadow-sm shrink-0">
                        <input
                          type="color"
                          value={style.fillColor}
                          onChange={(e) => updateStyle(key, { fillColor: e.target.value })}
                          className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">Warna Isi</span>
                    </div>
                    <input
                      type="text"
                      value={style.fillColor.toUpperCase()}
                      onChange={(e) => {
                        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                          updateStyle(key, { fillColor: e.target.value });
                        }
                      }}
                      className="w-20 text-xs px-2 py-1.5 bg-gray-50 border border-gray-200 rounded font-mono text-gray-600 focus:outline-none focus:border-emerald-500"
                      maxLength={7}
                    />
                  </div>

                  {/* Fill Opacity */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-gray-500 font-medium">Opacity</span>
                    <div className="flex-1 flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={style.fillOpacity ?? 30}
                        onChange={(e) => updateStyle(key, { fillOpacity: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <span className="text-xs text-gray-600 w-8 text-right font-medium">{style.fillOpacity}%</span>
                    </div>
                  </div>

                  {/* Outline Color */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded border border-gray-300 overflow-hidden cursor-pointer shadow-sm shrink-0">
                        <input
                          type="color"
                          value={style.outlineColor}
                          onChange={(e) => updateStyle(key, { outlineColor: e.target.value })}
                          className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">Garis Tepi</span>
                    </div>
                    <input
                      type="text"
                      value={style.outlineColor.toUpperCase()}
                      onChange={(e) => {
                        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                          updateStyle(key, { outlineColor: e.target.value });
                        }
                      }}
                      className="w-20 text-xs px-2 py-1.5 bg-gray-50 border border-gray-200 rounded font-mono text-gray-600 focus:outline-none focus:border-emerald-500"
                      maxLength={7}
                    />
                  </div>

                  {/* Outline Opacity */}
                  <div className="flex items-center justify-between gap-4 mt-2">
                    <span className="text-xs text-gray-500 font-medium">Opacity</span>
                    <div className="flex-1 flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={style.outlineOpacity ?? 80}
                        onChange={(e) => updateStyle(key, { outlineOpacity: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <span className="text-xs text-gray-600 w-8 text-right font-medium">{style.outlineOpacity ?? 80}%</span>
                    </div>
                  </div>

                  {/* Reset */}
                  <button
                    onClick={() => resetStyle(key)}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                  >
                    <RotateCcw size={13} />
                    Reset ke Default
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Tematik Layer Row — only shown when tematik is active */}
        {activeTematik && <TematikLayerRow ctx={ctx} />}

        {/* Uploaded Layers */}
        {isUploadEnabled && ctx.uploadedLayers && ctx.uploadedLayers.length > 0 && (
          <div className="pt-2 mt-2 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Layer Tambahan ({ctx.uploadedLayers.length})
              </h4>
              <span className="text-[10px] text-emerald-600 font-medium">
                Atas = Terdepan di Peta
              </span>
            </div>

            <div className="space-y-1.5">
              {ctx.uploadedLayers.map((layer, index) => {
                const isVisible = layer.visible;
                const isDragging = draggedIndex === index;
                const isDragOver = dragOverIndex === index;
                const isDragAbove = isDragOver && draggedIndex !== null && draggedIndex > index;
                const isDragBelow = isDragOver && draggedIndex !== null && draggedIndex < index;

                const toggleVisibility = () => {
                  const newLayers = ctx.uploadedLayers.map((l) =>
                    l.id === layer.id ? { ...l, visible: !l.visible } : l
                  );
                  ctx.setUploadedLayers(newLayers);
                };

                const removeLayer = () => {
                  const newLayers = ctx.uploadedLayers.filter((l) => l.id !== layer.id);
                  ctx.setUploadedLayers(newLayers);
                };

                const updateColor = (color: string) => {
                  const newLayers = ctx.uploadedLayers.map((l) =>
                    l.id === layer.id ? { ...l, color } : l
                  );
                  ctx.setUploadedLayers(newLayers);
                };

                const zoomToLayer = () => {
                  if (!ctx.map) return;
                  const bbox = getGeoJSONBBox(layer.geojson);
                  if (bbox) {
                    ctx.map.fitBounds(bbox, { padding: 50, duration: 1500 });
                  } else {
                    Swal.fire('Info', 'Tidak dapat menemukan koordinat pada layer ini', 'info');
                  }
                };

                return (
                  <div
                    key={layer.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedIndex(index);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', String(index));
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragOverIndex !== index) {
                        setDragOverIndex(index);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedIndex !== null && draggedIndex !== index) {
                        handleReorder(draggedIndex, index);
                      }
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    }}
                    onDragEnd={() => {
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    }}
                    className={`border rounded-lg transition-all ${
                      isDragging
                        ? 'opacity-40 border-dashed border-emerald-400 bg-emerald-50/40 scale-[0.98]'
                        : isDragAbove
                        ? 'border-t-2 border-t-emerald-500 border-gray-200 bg-emerald-50/10'
                        : isDragBelow
                        ? 'border-b-2 border-b-emerald-500 border-gray-200 bg-emerald-50/10'
                        : 'border-gray-100 hover:border-gray-200 bg-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-center p-2.5 gap-1.5 rounded-lg bg-white">
                      {/* Drag Handle */}
                      <div
                        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-600 p-0.5 rounded transition-colors shrink-0"
                        title="Tarik (drag) untuk mengatur urutan layer di peta"
                      >
                        <GripVertical size={15} />
                      </div>

                      {/* Color Dot */}
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: layer.color, border: '2px solid white', boxShadow: '0 0 0 1px #e5e7eb' }}
                      />

                      {/* Visibility Toggle */}
                      <button
                        onClick={toggleVisibility}
                        onMouseDown={(e) => e.stopPropagation()}
                        className={`p-1 rounded-md transition-colors shrink-0 ${
                          isVisible ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={isVisible ? 'Sembunyikan Layer' : 'Tampilkan Layer'}
                      >
                        {isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>

                      {/* Layer Name */}
                      <span className="text-xs flex-1 text-gray-700 font-medium truncate" title={layer.name}>
                        {layer.name}
                      </span>

                      {/* Reorder Arrows (Up/Down) */}
                      {ctx.uploadedLayers.length > 1 && (
                        <div className="flex flex-col gap-0 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => moveLayerUp(index)}
                            disabled={index === 0}
                            className={`p-0.5 rounded transition-colors ${
                              index === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-emerald-600 hover:bg-gray-100'
                            }`}
                            title="Pindahkan ke atas (tampil lebih depan)"
                          >
                            <ChevronUp size={11} />
                          </button>
                          <button
                            onClick={() => moveLayerDown(index)}
                            disabled={index === ctx.uploadedLayers.length - 1}
                            className={`p-0.5 rounded transition-colors ${
                              index === ctx.uploadedLayers.length - 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-emerald-600 hover:bg-gray-100'
                            }`}
                            title="Pindahkan ke bawah (tampil lebih belakang)"
                          >
                            <ChevronDown size={11} />
                          </button>
                        </div>
                      )}

                      {/* Zoom to layer */}
                      <button
                        onClick={zoomToLayer}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
                        title="Zoom ke Layer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                      </button>

                      {/* Color Picker */}
                      <div
                        onMouseDown={(e) => e.stopPropagation()}
                        className="relative w-6 h-6 rounded-md border border-gray-200 overflow-hidden cursor-pointer shadow-sm shrink-0 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <input
                          type="color"
                          value={layer.color}
                          onChange={(e) => updateColor(e.target.value)}
                          className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer opacity-0"
                          title="Ubah Warna"
                        />
                        <Palette size={13} className="text-gray-500 pointer-events-none" />
                      </div>

                      {/* Remove Layer */}
                      <button
                        onClick={removeLayer}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="p-1 rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                        title="Hapus Layer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Export Layer Modal */}
      {canExport && (
        <ExportLayerModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </div>
  );
}
