'use client';

import { useState, useCallback, useContext, useEffect } from 'react';
import { Search, Layers, Printer, X, Image as ImageIcon, FileText, Filter, Download } from 'lucide-react';
import { MapContext } from '@/components/providers/MapProvider';
import { useAuth } from '@/contexts/AuthContext';
import { SearchBox } from './SearchBox';
import { LayerControl } from './LayerControl';
import { UploadLayerPanel } from './UploadLayerPanel';
import { ExportLayerModal } from './ExportLayerModal';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Read legend items from the DOM and draw them on a canvas context
function drawLegendOnCanvas(ctx: CanvasRenderingContext2D, mapWidth: number, mapHeight: number, mode: 'landscape' | 'portrait') {
  const legendEl = document.querySelector('.legend-container') as HTMLElement;
  if (!legendEl) return;

  // Get legend title
  const titleEl = legendEl.querySelector('h4');
  const title = titleEl?.textContent || 'LEGENDA';

  // Get legend items (each has a colored div + text span)
  const items: { color: string; label: string }[] = [];
  const rows = legendEl.querySelectorAll('.flex.items-center, .flex.items-start');
  rows.forEach((row) => {
    const colorDiv = row.querySelector('div[style]') as HTMLElement;
    const labelSpan = row.querySelector('span');
    if (colorDiv && labelSpan) {
      items.push({
        color: colorDiv.style.backgroundColor || '#10b981',
        label: labelSpan.textContent || '',
      });
    }
  });

  if (items.length === 0) return;

  // Layout constants
  const isPortrait = mode === 'portrait';
  const padding = isPortrait ? 6 : 16;
  const itemH = isPortrait ? 12 : 22;
  const titleH = isPortrait ? 16 : 28;
  const boxW = isPortrait ? 8 : 16;
  const boxH = isPortrait ? 6 : 12;
  const gap = isPortrait ? 4 : 8;
  const fontSize = isPortrait ? 7 : 13;
  const titleFontSize = isPortrait ? 7 : 11;

  // Measure max text width
  ctx.font = `${fontSize}px sans-serif`;
  let maxTextW = 0;
  items.forEach((item) => {
    const w = ctx.measureText(item.label).width;
    if (w > maxTextW) maxTextW = w;
  });

  const legendW = padding * 2 + boxW + gap + maxTextW + 10;
  const legendH = padding + titleH + items.length * itemH + padding;

  let lx = 24;
  if (isPortrait) {
    // Hitung area aman (safe area) agar tidak terpotong saat di-crop ke portrait
    const aspect = 1 / 1.414; // rasio portrait
    let targetWidth = mapWidth;
    if (mapWidth / mapHeight > aspect) {
      targetWidth = mapHeight * aspect;
    }
    const safeLeft = (mapWidth - targetWidth) / 2;
    lx = safeLeft + 16;
  }
  
  const ly = mapHeight - legendH - (isPortrait ? 16 : 24);

  // Draw background with rounded rect
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(lx, ly, legendW, legendH, 10);
  ctx.fill();
  ctx.stroke();

  // Draw title
  ctx.fillStyle = '#6b7280';
  ctx.font = `bold ${titleFontSize}px sans-serif`;
  ctx.textBaseline = 'top';
  ctx.fillText(title.toUpperCase(), lx + padding, ly + padding);

  // Draw items
  ctx.font = `500 ${fontSize}px sans-serif`;
  items.forEach((item, i) => {
    const iy = ly + padding + titleH + i * itemH;

    // Colored box
    ctx.fillStyle = item.color;
    ctx.fillRect(lx + padding, iy, boxW, boxH);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(lx + padding, iy, boxW, boxH);

    // Label text
    ctx.fillStyle = '#374151';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.label, lx + padding + boxW + gap, iy + boxH / 2);
  });

  ctx.restore();
}

export function MapUIOverlay() {
  const ctx = useContext(MapContext);
  const { canExport } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLayerOpen, setIsLayerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isFilterBlokOpen, setIsFilterBlokOpen] = useState(false);
  const [availableBlocks, setAvailableBlocks] = useState<string[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [printPreview, setPrintPreview] = useState<{ landscape: string, portrait: string } | null>(null);
  const [printOrientation, setPrintOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [capturing, setCapturing] = useState(false);

  const isPrintEnabled = process.env.NEXT_PUBLIC_FEATURE_PRINT_MAP !== 'false';
  const isUploadEnabled = process.env.NEXT_PUBLIC_FEATURE_UPLOAD_LAYER !== 'false';
  const isFilterBlokEnabled = process.env.NEXT_PUBLIC_FEATURE_FILTER_BLOK !== 'false';

  useEffect(() => {
    if (!ctx?.selectedDesa || !isFilterBlokEnabled) {
      setAvailableBlocks([]);
      ctx?.setActiveBlokFilter(null);
      setIsFilterBlokOpen(false);
      return;
    }

    const fetchBlocks = async () => {
      setLoadingBlocks(true);
      try {
        const res = await fetch(`/api/bloks?desa=${ctx.selectedDesa}`);
        const data = await res.json();
        if (data.success) {
          setAvailableBlocks(data.data || []);
        } else {
          setAvailableBlocks([]);
        }
      } catch (err) {
        console.error('Failed to fetch blocks', err);
      } finally {
        setLoadingBlocks(false);
      }
    };

    fetchBlocks();
  }, [ctx?.selectedDesa, isFilterBlokEnabled]);

  const handleCaptureMap = useCallback(() => {
    const canvas = (
      document.querySelector('.maplibregl-canvas') ||
      document.querySelector('.mapboxgl-canvas')
    ) as HTMLCanvasElement;

    if (!canvas) {
      alert('Canvas peta tidak ditemukan');
      return;
    }

    setCapturing(true);

    try {
      const scale = 3; // Upscale factor for HD resolution
      const mapWidth = canvas.width;
      const mapHeight = canvas.height;

      // Create landscape composite
      const compL = document.createElement('canvas');
      compL.width = mapWidth * scale;
      compL.height = mapHeight * scale;
      const ctxL = compL.getContext('2d')!;
      ctxL.imageSmoothingEnabled = true;
      ctxL.imageSmoothingQuality = 'high';
      ctxL.drawImage(canvas, 0, 0, mapWidth * scale, mapHeight * scale);
      
      ctxL.scale(scale, scale);
      drawLegendOnCanvas(ctxL, mapWidth, mapHeight, 'landscape');
      ctxL.setTransform(1, 0, 0, 1, 0, 0); // reset scale
      
      const imgL = compL.toDataURL('image/png');

      // Create portrait composite with cropping
      const aspect = 1 / 1.414; // Portrait aspect ratio
      let pWidth = mapWidth;
      let pHeight = mapHeight;
      
      if (mapWidth / mapHeight > aspect) {
        // Wider than portrait, crop width
        pWidth = pHeight * aspect;
      } else {
        pHeight = pWidth / aspect;
      }

      const compP = document.createElement('canvas');
      compP.width = pWidth * scale;
      compP.height = pHeight * scale;
      const ctxP = compP.getContext('2d')!;
      ctxP.imageSmoothingEnabled = true;
      ctxP.imageSmoothingQuality = 'high';
      
      // Calculate offset to center the map
      const sx = (mapWidth - pWidth) / 2;
      const sy = (mapHeight - pHeight) / 2;
      
      // Draw the map shifted so the center is kept
      ctxP.drawImage(canvas, -sx * scale, -sy * scale, mapWidth * scale, mapHeight * scale);
      
      // Draw legend (we need to shift the context so drawLegendOnCanvas which uses absolute coords works)
      ctxP.scale(scale, scale);
      ctxP.translate(-sx, -sy);
      drawLegendOnCanvas(ctxP, mapWidth, mapHeight, 'portrait');
      ctxP.setTransform(1, 0, 0, 1, 0, 0); // reset scale
      
      // Save as PNG for lossless HD quality
      const imgP = compP.toDataURL('image/png');

      setPrintPreview({ landscape: imgL, portrait: imgP });
    } catch (e) {
      console.error('Gagal menangkap peta:', e);
      alert('Gagal menangkap gambar peta');
    } finally {
      setCapturing(false);
    }
  }, []);

  const handleDownloadImage = useCallback(() => {
    if (!printPreview) return;
    
    const currentPreview = printPreview[printOrientation];
    const link = document.createElement('a');
    link.download = `peta-${printOrientation}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = currentPreview;
    link.click();
  }, [printPreview, printOrientation]);

  const handleDownloadPDF = useCallback(() => {
    if (!printPreview) return;

    const currentPreview = printPreview[printOrientation];

    const overlay = document.createElement('div');
    overlay.id = 'print-map-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '999999',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'white',
    });

    const style = document.createElement('style');
    style.innerHTML = `@media print { @page { size: ${printOrientation}; margin: 0; } body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; } }`;
    overlay.appendChild(style);

    const imgContainer = document.createElement('div');
    Object.assign(imgContainer.style, {
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden'
    });

    const img = new Image();
    img.src = currentPreview;
    
    // Since portrait is already cropped, we can use contain for both
    Object.assign(img.style, {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
    });

    imgContainer.appendChild(img);
    overlay.appendChild(imgContainer);
    document.body.appendChild(overlay);

    // We can't clear printPreview yet because they might cancel the print dialogue,
    // but typically we don't need to clear it. Let's just leave it open.
    // setPrintPreview(null); // Optional: remove if you want modal to stay open

    const doPrint = () => {
      window.print();
      overlay.remove();
    };

    if (img.complete) {
      setTimeout(doPrint, 200);
    } else {
      img.onload = () => setTimeout(doPrint, 200);
    }
  }, [printPreview, printOrientation]);

  return (
    <>
      {/* Top Right Buttons */}
      <div className="absolute top-4 right-4 z-20 flex gap-2 pointer-events-auto print-hide">
        <button
          onClick={() => {
            setIsSearchOpen(!isSearchOpen);
            if (!isSearchOpen) setIsLayerOpen(false);
          }}
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition-colors border border-gray-200"
          title="Pencarian"
        >
          <Search size={20} />
        </button>
        <button
          onClick={() => {
            setIsLayerOpen(!isLayerOpen);
            if (!isLayerOpen) setIsSearchOpen(false);
          }}
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition-colors border border-gray-200"
          title="Layer Control"
        >
          <Layers size={20} />
        </button>
        {isFilterBlokEnabled && ctx?.selectedDesa && (
          <div className="relative">
            <button
              onClick={() => {
                setIsFilterBlokOpen(!isFilterBlokOpen);
                if (!isFilterBlokOpen) {
                  setIsSearchOpen(false);
                  setIsLayerOpen(false);
                  setIsUploadOpen(false);
                }
              }}
              className={`w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center transition-colors border border-gray-200 ${ctx?.activeBlokFilter ? 'text-emerald-600 border-emerald-500 bg-emerald-50' : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'}`}
              title="Filter Blok"
            >
              <Filter size={20} />
            </button>
            {isFilterBlokOpen && (
              <div className="absolute top-12 right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Filter Blok</span>
                </div>
                <div className="max-h-60 overflow-y-auto p-2 flex flex-col gap-1">
                  {loadingBlocks ? (
                    <div className="text-center py-4 text-xs text-gray-500">Memuat data...</div>
                  ) : availableBlocks.length === 0 ? (
                    <div className="text-center py-4 text-xs text-gray-500">Tidak ada data blok</div>
                  ) : (
                    <>
                      <button
                        onClick={() => { ctx.setActiveBlokFilter(null); setIsFilterBlokOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${!ctx.activeBlokFilter ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        Semua Blok
                      </button>
                      {availableBlocks.map(blok => (
                        <button
                          key={blok}
                          onClick={() => { ctx.setActiveBlokFilter(blok); setIsFilterBlokOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${ctx.activeBlokFilter === blok ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          Blok {blok}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {isUploadEnabled && (
          <button
            onClick={() => {
              setIsUploadOpen(!isUploadOpen);
              if (!isUploadOpen) {
                setIsSearchOpen(false);
                setIsLayerOpen(false);
              }
            }}
            className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition-colors border border-gray-200"
            title="Upload Data Vektor"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          </button>
        )}
        {canExport && (
          <button
            onClick={() => {
              setIsExportOpen(true);
              setIsSearchOpen(false);
              setIsLayerOpen(false);
              setIsUploadOpen(false);
            }}
            className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition-colors border border-gray-200"
            title="Export Layer Default"
          >
            <Download size={20} />
          </button>
        )}
        {isPrintEnabled && (
          <button
            onClick={handleCaptureMap}
            disabled={capturing}
            className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition-colors border border-gray-200 disabled:opacity-50"
            title="Cetak / Unduh Peta"
          >
            {capturing ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-emerald-500 rounded-full animate-spin" />
            ) : (
              <Printer size={20} />
            )}
          </button>
        )}
      </div>

      {/* Layer Control Panel */}
      {isLayerOpen && (
        <div className="absolute top-16 right-4 z-20 pointer-events-auto">
          <ErrorBoundary>
            <LayerControl onClose={() => setIsLayerOpen(false)} />
          </ErrorBoundary>
        </div>
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto w-full max-w-lg px-4">
            <ErrorBoundary>
              <SearchBox onClose={() => setIsSearchOpen(false)} />
            </ErrorBoundary>
          </div>
        </div>
      )}

      {/* Upload Panel */}
      {isUploadEnabled && isUploadOpen && (
        <div className="absolute top-16 right-4 z-20 pointer-events-auto">
          <ErrorBoundary>
            <UploadLayerPanel onClose={() => setIsUploadOpen(false)} />
          </ErrorBoundary>
        </div>
      )}

      {/* Print Preview Modal */}
      {printPreview && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm print-hide">
          <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-4xl h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
              <h3 className="text-lg font-bold text-gray-800">Preview Peta</h3>
              <button
                onClick={() => setPrintPreview(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Preview Image */}
            <div className="flex-1 p-4 bg-gray-50 flex items-center justify-center overflow-hidden min-h-0 relative">
              <div 
                className="transition-all duration-300 shadow-md border border-gray-200 bg-white rounded-lg overflow-hidden relative flex items-center justify-center"
                style={{
                  height: '100%',
                  width: printOrientation === 'portrait' ? 'max-content' : '100%',
                }}
              >
                {printOrientation === 'portrait' && (
                  <svg viewBox="0 0 707 1000" className="h-full opacity-0 pointer-events-none" />
                )}
                <img
                  src={printPreview[printOrientation]}
                  alt="Preview Peta"
                  className={printOrientation === 'portrait' ? "absolute inset-0 w-full h-full" : "w-full h-full"}
                  style={{
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 shrink-0">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Orientasi:</label>
                <select
                  value={printOrientation}
                  onChange={(e) => setPrintOrientation(e.target.value as 'landscape' | 'portrait')}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="landscape">Landscape</option>
                  <option value="portrait">Portrait</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPrintPreview(null)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDownloadImage}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <ImageIcon size={16} />
                  Download Image
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <FileText size={16} />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Layer Modal */}
      {canExport && (
        <ExportLayerModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </>
  );
}
