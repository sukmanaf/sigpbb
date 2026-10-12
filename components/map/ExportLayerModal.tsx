'use client';

import { useState, useEffect, useContext, useId } from 'react';
import { X, Download, Layers, MapPin, Database, Check, Loader2, Info } from 'lucide-react';
import { MapContext } from '@/components/providers/MapProvider';
import { useAuth } from '@/contexts/AuthContext';
import Swal from 'sweetalert2';

interface ExportLayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface KecamatanItem {
  d_kd_kec: string;
  d_nm_kec: string;
}

interface DesaItem {
  d_kd_kel: string;
  d_nm_kel: string;
}

type LayerType = 'nops' | 'desas' | 'bloks' | 'bangunans' | 'all';
type FormatType = 'geojson' | 'shp';

export function ExportLayerModal({ isOpen, onClose }: ExportLayerModalProps) {
  const ctx = useContext(MapContext);
  const { user } = useAuth();
  const baseId = useId();

  const [selectedLayer, setSelectedLayer] = useState<LayerType>('nops');
  const [selectedFormat, setSelectedFormat] = useState<FormatType>('geojson');
  const [filterMode, setFilterMode] = useState<'all' | 'filtered'>('filtered');

  // Wilayah states
  const [kecamatans, setKecamatans] = useState<KecamatanItem[]>([]);
  const [selectedKec, setSelectedKec] = useState<string>('');
  const [desasList, setDesasList] = useState<DesaItem[]>([]);
  const [selectedDesa, setSelectedDesa] = useState<string>('');
  const [bloksList, setBloksList] = useState<string[]>([]);
  const [selectedBlok, setSelectedBlok] = useState<string>('');

  // Loading & status states
  const [loadingKec, setLoadingKec] = useState(false);
  const [loadingDesa, setLoadingDesa] = useState(false);
  const [loadingBlok, setLoadingBlok] = useState(false);
  const [featureCount, setFeatureCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Reset all dropdown filters whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedKec('');
      setSelectedDesa('');
      setSelectedBlok('');
      setBloksList([]);
      setFilterMode('filtered');
    }
  }, [isOpen]);

  // Fetch Kecamatans list
  useEffect(() => {
    if (!isOpen) return;
    async function loadKecamatans() {
      setLoadingKec(true);
      try {
        const res = await fetch('/api/kecamatans');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setKecamatans(json.data);
        }
      } catch (err) {
        console.error('Failed to load kecamatans:', err);
      } finally {
        setLoadingKec(false);
      }
    }
    loadKecamatans();
  }, [isOpen]);

  // Fetch Desas list when selectedKec changes
  useEffect(() => {
    if (!isOpen) return;
    async function loadDesas() {
      setLoadingDesa(true);
      try {
        const url = selectedKec
          ? `/api/desas/list?kecamatan=${encodeURIComponent(selectedKec)}`
          : '/api/desas/list';
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setDesasList(json.data);
          // If current selectedDesa doesn't belong to current kec, reset
          if (selectedKec && selectedDesa && !json.data.some((d: DesaItem) => d.d_kd_kel === selectedDesa)) {
            setSelectedDesa('');
            setSelectedBlok('');
          }
        }
      } catch (err) {
        console.error('Failed to load desas:', err);
      } finally {
        setLoadingDesa(false);
      }
    }
    loadDesas();
  }, [isOpen, selectedKec]);

  // Fetch Bloks list when selectedDesa changes
  useEffect(() => {
    if (!isOpen || !selectedDesa) {
      setBloksList([]);
      setSelectedBlok('');
      return;
    }
    async function loadBloks() {
      setLoadingBlok(true);
      try {
        const res = await fetch(`/api/bloks?desa=${encodeURIComponent(selectedDesa)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setBloksList(json.data);
        }
      } catch (err) {
        console.error('Failed to load bloks:', err);
      } finally {
        setLoadingBlok(false);
      }
    }
    loadBloks();
  }, [isOpen, selectedDesa]);

  // Auto-fetch feature count preview
  useEffect(() => {
    if (!isOpen) return;

    let isSubscribed = true;
    setLoadingCount(true);

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        params.append('action', 'count');
        params.append('layer', selectedLayer);

        if (filterMode === 'filtered') {
          if (selectedKec) params.append('kecamatan', selectedKec);
          if (selectedDesa) params.append('desa', selectedDesa);
          if (selectedBlok) params.append('blok', selectedBlok);
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/export-layer?${params.toString()}`, {
          credentials: 'include',
          headers,
        });
        const data = await res.json();
        if (isSubscribed) {
          if (data.success && typeof data.count === 'number') {
            setFeatureCount(data.count);
          } else {
            setFeatureCount(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch count preview:', err);
        if (isSubscribed) setFeatureCount(null);
      } finally {
        if (isSubscribed) setLoadingCount(false);
      }
    }, 250);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [isOpen, selectedLayer, filterMode, selectedKec, selectedDesa, selectedBlok]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      const params = new URLSearchParams();
      params.append('action', 'download');
      params.append('layer', selectedLayer);
      params.append('format', selectedFormat);

      if (filterMode === 'filtered') {
        if (selectedKec) params.append('kecamatan', selectedKec);
        if (selectedDesa) params.append('desa', selectedDesa);
        if (selectedBlok) params.append('blok', selectedBlok);
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/export-layer?${params.toString()}`, {
        credentials: 'include',
        headers,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `Ekspor gagal (status ${res.status})`);
      }

      // Read filename from Content-Disposition header
      const disposition = res.headers.get('content-disposition');
      const ext = selectedFormat === 'shp' ? 'zip' : 'geojson';
      let filename = `smartmap_${selectedLayer}_${new Date().toISOString().slice(0, 10)}.${ext}`;
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match?.[1]) filename = match[1];
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      Swal.fire({
        icon: 'success',
        title: 'Ekspor Berhasil!',
        text: `File ${filename} telah berhasil diunduh.`,
        timer: 3000,
        showConfirmButton: false,
      });

      onClose();
    } catch (err: any) {
      console.error('Download error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Ekspor Gagal',
        text: err?.message || 'Terjadi kesalahan saat mengunduh data.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const layerOptions: { id: LayerType; label: string; desc: string; icon: string; color: string }[] = [
    { id: 'nops', label: 'Bidang NOP', desc: 'Data bidang tanah & luas PBB', icon: '🟧', color: 'border-amber-500/40' },
    { id: 'desas', label: 'Desa / Kelurahan', desc: 'Batas wilayah kelurahan', icon: '🟩', color: 'border-emerald-500/40' },
    { id: 'bloks', label: 'Blok PBB', desc: 'Batas zona blok bidang PBB', icon: '🟦', color: 'border-blue-500/40' },
    { id: 'bangunans', label: 'Bangunan', desc: 'Poligon jejak bangunan', icon: '🟪', color: 'border-purple-500/40' },
    { id: 'all', label: 'Semua Layer', desc: 'Seluruh layer default sekaligus', icon: '🗂️', color: 'border-teal-500/40' },
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${baseId}-title`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shadow-inner">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 id={`${baseId}-title`} className="text-lg font-bold leading-tight">Export Layer Default</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Unduh data spasial & tabular untuk analisis GIS (QGIS, ArcGIS, Excel)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Tutup Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-gray-800">
          {/* User role info pill */}
          <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200/60 rounded-xl p-3 text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <span className="font-semibold px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900 uppercase tracking-wider text-[10px]">
                {user?.role || 'authorized'}
              </span>
              <span>Hak akses ekspor diverifikasi (Admin, Bapenda, BPN).</span>
            </div>
            <span className="text-[11px] font-medium text-emerald-700">Kota Pasuruan</span>
          </div>

          {/* 1. Pilih Layer */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Layers size={14} className="text-emerald-600" />
              1. Pilih Layer yang Akan Diekspor
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {layerOptions.map((opt) => {
                const isSelected = selectedLayer === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedLayer(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xl mb-1">{opt.icon}</span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className={`font-semibold text-sm ${isSelected ? 'text-emerald-900' : 'text-gray-800'}`}>
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-gray-500 leading-tight mt-0.5">
                        {opt.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Filter Wilayah */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <MapPin size={14} className="text-emerald-600" />
              2. Cakupan Wilayah
            </label>

            {/* Wilayah Mode Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-3 max-w-sm">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  filterMode === 'all'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Semua Wilayah (Kota)
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('filtered')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  filterMode === 'filtered'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Filter Wilayah
              </button>
            </div>

            {/* Filter Dropdowns */}
            {filterMode === 'filtered' && (
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Kecamatan */}
                  <div>
                    <label htmlFor={`${baseId}-kec`} className="block text-[11px] font-medium text-gray-600 mb-1">
                      Kecamatan
                    </label>
                    <select
                      id={`${baseId}-kec`}
                      value={selectedKec}
                      onChange={(e) => {
                        setSelectedKec(e.target.value);
                        setSelectedDesa('');
                        setSelectedBlok('');
                        setBloksList([]);
                      }}
                      disabled={loadingKec}
                      className="w-full text-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
                    >
                      <option value="">-- Semua Kecamatan --</option>
                      {kecamatans.map((k) => (
                        <option key={k.d_kd_kec} value={k.d_kd_kec}>
                          {k.d_nm_kec} ({k.d_kd_kec})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Desa / Kelurahan */}
                  <div>
                    <label htmlFor={`${baseId}-desa`} className="block text-[11px] font-medium text-gray-600 mb-1 flex items-center justify-between">
                      <span>Desa / Kelurahan</span>
                      {loadingDesa && <span className="text-[10px] text-gray-400">Memuat...</span>}
                    </label>
                    <select
                      id={`${baseId}-desa`}
                      value={selectedDesa}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedDesa(val);
                        setSelectedBlok('');
                        if (val && !selectedKec) {
                          const cleanD = val.replace(/[^0-9]/g, '');
                          const matchedKec = kecamatans.find((k) => cleanD.startsWith(k.d_kd_kec.replace(/[^0-9]/g, '')));
                          if (matchedKec) {
                            setSelectedKec(matchedKec.d_kd_kec);
                          }
                        }
                      }}
                      disabled={loadingDesa}
                      className="w-full text-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
                    >
                      <option value="">-- Semua Desa/Kelurahan --</option>
                      {desasList.map((d) => (
                        <option key={d.d_kd_kel} value={d.d_kd_kel}>
                          {d.d_nm_kel} ({d.d_kd_kel})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Blok Filter (Visible if desa is chosen and layer is not just 'desas') */}
                {selectedLayer !== 'desas' && selectedDesa && (
                  <div>
                    <label htmlFor={`${baseId}-blok`} className="block text-[11px] font-medium text-gray-600 mb-1 flex items-center justify-between">
                      <span>Blok PBB</span>
                      {loadingBlok && <span className="text-[10px] text-gray-400">Memuat blok...</span>}
                    </label>
                    <select
                      id={`${baseId}-blok`}
                      value={selectedBlok}
                      onChange={(e) => setSelectedBlok(e.target.value)}
                      disabled={loadingBlok}
                      className="w-full text-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 max-w-sm disabled:opacity-50"
                    >
                      <option value="">-- Semua Blok dalam Kelurahan --</option>
                      {bloksList.map((blk) => (
                        <option key={blk} value={blk}>
                          Blok {blk}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Format Ekspor */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Database size={14} className="text-emerald-600" />
              3. Format Berkas
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedFormat('geojson')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  selectedFormat === 'geojson'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                  .JSON
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-800">GeoJSON (.geojson)</div>
                  <div className="text-[11px] text-gray-500 leading-tight">
                    Format spasial standar untuk QGIS, ArcGIS, Leaflet & MapLibre.
                  </div>
                </div>
                {selectedFormat === 'geojson' && (
                  <Check size={16} className="text-emerald-600 shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('shp')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  selectedFormat === 'shp'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                  .SHP
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-800">Shapefile (.zip)</div>
                  <div className="text-[11px] text-gray-500 leading-tight">
                    Paket arsip ESRI (.shp, .shx, .dbf, .prj) siap pakai di ArcGIS & QGIS.
                  </div>
                </div>
                {selectedFormat === 'shp' && (
                  <Check size={16} className="text-emerald-600 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* 4. Estimasi Jumlah Fitur */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-gray-400" />
              <span className="text-xs text-gray-600">Estimasi Jumlah Fitur:</span>
            </div>
            <div>
              {loadingCount ? (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Loader2 size={14} className="animate-spin text-emerald-600" />
                  <span>Menghitung...</span>
                </div>
              ) : featureCount !== null ? (
                <span className="text-sm font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                  {featureCount.toLocaleString('id-ID')} fitur
                </span>
              ) : (
                <span className="text-xs text-gray-400">-</span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isDownloading}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-200/60 rounded-xl transition-colors disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading || (featureCount === 0 && !loadingCount)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Mengekspor & Mengunduh...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Unduh {selectedFormat.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

