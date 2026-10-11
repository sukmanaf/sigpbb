'use client';
import Swal from 'sweetalert2';

import { useState, useContext, FormEvent } from 'react';
import { MapContext } from '@/components/providers/MapProvider';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchResultItem {
  NAMA: string;
  ALAMAT: string;
  NOP: string;
}

export function SearchBox({ onClose }: { onClose?: () => void }) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('NOP');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const ctx = useContext(MapContext);

  const zoomAndHighlightNop = (data: any) => {
    if (!ctx || !ctx.map || !data.geom) return;

    // Parse geometry
    const geom = typeof data.geom === 'string' ? JSON.parse(data.geom) : data.geom;

    // Extract all coordinates to support Polygon and MultiPolygon
    const extractCoords = (coords: any): [number, number][] => {
      if (typeof coords[0] === 'number') return [coords as [number, number]];
      return coords.flatMap(extractCoords);
    };
    const allCoords = extractCoords(geom.coordinates);

    if (allCoords.length > 0) {
      let minLng = allCoords[0][0], maxLng = allCoords[0][0];
      let minLat = allCoords[0][1], maxLat = allCoords[0][1];
      allCoords.forEach(([lng, lat]: [number, number]) => {
        minLng = Math.min(minLng, lng); maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
      });

      // 1. If NOP has a desa code, activate that desa & ensure nops layer is displayed
      if (data.d_kd_kel) {
        ctx.setSelectedDesa(data.d_kd_kel);
        if (data.d_nm_kel) ctx.setSelectedDesaName(data.d_nm_kel);

        ['nops', 'bloks', 'bangunans'].forEach((layer) => {
          const source = ctx.map.getSource(layer);
          if (source?.setTiles) {
            source.setTiles([`/api/tiles/${layer}/{z}/{x}/{y}?desa=${data.d_kd_kel}`]);
            if ((source as any).clearTiles) (source as any).clearTiles();
          }
        });

        ctx.setLayers({ ...ctx.layers, desas: false, nops: true });

        const hide = ['desas-fill', 'desas-line', 'desas-label'];
        const show = ['nops-fill', 'nops-line', 'nops-label'];
        hide.forEach((id) => ctx.map.getLayer(id) && ctx.map.setLayoutProperty(id, 'visibility', 'none'));
        show.forEach((id) => ctx.map.getLayer(id) && ctx.map.setLayoutProperty(id, 'visibility', 'visible'));
      }

      // 2. Zoom to the polygon
      ctx.map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 80, maxZoom: 19 });

      // 3. Highlight / hover the polygon on the map
      const highlightFeature = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {
            d_nop: data.d_nop || '',
            d_luas: data.d_luas || '',
            d_nm_kel: data.d_nm_kel || '',
          },
          geometry: geom,
        }],
      };

      const sourceId = 'search-highlight';
      const fillId = 'search-highlight-fill';
      const lineId = 'search-highlight-line';

      if (ctx.map.getSource(sourceId)) {
        ctx.map.getSource(sourceId).setData(highlightFeature);
      } else {
        ctx.map.addSource(sourceId, {
          type: 'geojson',
          data: highlightFeature,
        });

        ctx.map.addLayer({
          id: fillId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': '#facc15', // Vibrant yellow highlight
            'fill-opacity': 0.65,
          },
        });

        ctx.map.addLayer({
          id: lineId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#b45309', // Dark amber/orange border
            'line-width': 3.5,
          },
        });
      }

      // Dismiss existing popup if any
      if ((window as any)._searchPopup) {
        (window as any)._searchPopup.remove();
        (window as any)._searchPopup = null;
      }

      // Show Toast notification
      Swal.fire({
        icon: 'success',
        title: 'NOP Ditemukan',
        text: `${data.d_nop}${data.d_nm_kel ? ` (${data.d_nm_kel})` : ''}`,
        timer: 2500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
    }

    if (onClose) onClose();
  };

  const handleSelectResult = async (item: SearchResultItem) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(item.NOP)}&type=NOP`);
      const data = await res.json();
      if (res.ok && data && data.geom) {
        zoomAndHighlightNop(data);
      } else {
        Swal.fire('Data Peta Belum Ada', `Objek pajak dengan NOP ${item.NOP} ditemukan di SISMIOP, namun geometri poligonnya belum tersedia di database peta GIS.`, 'warning');
      }
    } catch {
      Swal.fire('Error!', 'Gagal memuat poligon peta untuk NOP tersebut', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !ctx || !ctx.map) return;
    
    setIsSearching(true);
    setResults([]);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${searchType}`);
      const data = await res.json();
      
      if (res.ok) {
        if (data.type === 'list' && Array.isArray(data.data)) {
          setResults(data.data);
        } else if (data.geom) {
          zoomAndHighlightNop(data);
        } else {
          Swal.fire('Tidak Ditemukan', 'Data tidak ditemukan di database', 'info');
        }
      } else {
        const errorMsg = data?.error || 'Data tidak ditemukan di database';
        if (res.status === 504 || errorMsg.includes('timeout') || errorMsg.includes('SISMIOP') || errorMsg.includes('Server')) {
          Swal.fire({
            icon: 'warning',
            title: 'Koneksi SISMIOP Bermasalah',
            text: errorMsg,
            footer: '<span class="text-xs text-gray-500">Pencarian Nama/Alamat membutuhkan koneksi ke server Bapenda. Anda dapat mencoba pencarian dengan NOP.</span>',
          });
        } else {
          Swal.fire('Tidak Ditemukan', errorMsg, 'info');
        }
      }
    } catch (error: any) {
      console.error('Search error:', error);
      Swal.fire('Error!', error?.message || 'Terjadi kesalahan saat mencari', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden w-full pointer-events-auto">
      {/* Green Header */}
      <div className="bg-emerald-600 px-4 py-3 flex items-center justify-between">
        <h2 className="text-white font-medium flex items-center gap-2">
          <Search size={18} />
          Pencarian Objek Pajak
        </h2>
        {onClose && (
          <button onClick={onClose} className="text-emerald-100 hover:text-white transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input 
              type="radio" 
              name="searchType" 
              value="NOP" 
              checked={searchType === 'NOP'}
              onChange={(e) => {
                setSearchType(e.target.value);
                setResults([]);
                setHasSearched(false);
              }}
              className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
            />
            NOP
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input 
              type="radio" 
              name="searchType" 
              value="Nama" 
              checked={searchType === 'Nama'}
              onChange={(e) => {
                setSearchType(e.target.value);
                setResults([]);
                setHasSearched(false);
              }}
              className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
            />
            Nama
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input 
              type="radio" 
              name="searchType" 
              value="Alamat" 
              checked={searchType === 'Alamat'}
              onChange={(e) => {
                setSearchType(e.target.value);
                setResults([]);
                setHasSearched(false);
              }}
              className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
            />
            Alamat
          </label>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder={
              searchType === 'NOP' 
                ? 'Masukkan NOP (contoh: 357504000801300120)' 
                : searchType === 'Nama' 
                  ? 'Masukkan nama wajib pajak (contoh: iskandar)...' 
                  : 'Masukkan alamat objek pajak...'
            }
            className="flex-1 px-3 py-2 border border-emerald-500 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-gray-800 text-sm placeholder:text-gray-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Mencari...</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>Cari</span>
              </>
            )}
          </button>
        </form>

        {/* Results List for Nama & Alamat */}
        {results.length > 0 && (
          <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 flex items-center justify-between text-white">
              <span className="text-xs font-semibold">
                📋 Hasil Pencarian ({results.length} data)
              </span>
              <span className="text-[11px] text-emerald-100">Klik untuk melihat di peta</span>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 bg-white">
              {results.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectResult(item)}
                  disabled={isSearching}
                  className="w-full text-left p-3 hover:bg-emerald-50/70 transition-colors flex items-start justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 truncate">
                      {item.NAMA}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      📍 {item.ALAMAT}
                    </div>
                    <div className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 inline-block px-1.5 py-0.5 rounded mt-1.5 border border-emerald-200">
                      {item.NOP}
                    </div>
                  </div>
                  <span className="text-emerald-600 text-xs font-medium shrink-0 group-hover:translate-x-0.5 transition-transform self-center">
                    Lihat →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {hasSearched && results.length === 0 && searchType !== 'NOP' && !isSearching && (
          <div className="text-center py-6 text-gray-400 text-sm">
            🔍 Tidak ada hasil untuk kata kunci tersebut
          </div>
        )}
      </div>
    </div>
  );
}

