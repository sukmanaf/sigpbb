'use client';
import Swal from 'sweetalert2';

import { useState, useContext, FormEvent } from 'react';
import { MapContext } from '@/components/providers/MapProvider';
import { Search, X } from 'lucide-react';

export function SearchBox({ onClose }: { onClose?: () => void }) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('NOP');
  const [isSearching, setIsSearching] = useState(false);
  const ctx = useContext(MapContext);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !ctx) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${searchType}`);
      const data = await res.json();
      
      if (data && data.geom && ctx.map) {
        ctx.setSelectedNop(data.d_nop);
        
        // Parse geometry and zoom to it
        const geom = typeof data.geom === 'string' ? JSON.parse(data.geom) : data.geom;
        const coords = geom.type === 'Polygon' ? geom.coordinates[0] : 
                       geom.type === 'MultiPolygon' ? geom.coordinates[0][0] : [];
        
        if (coords.length > 0) {
          let minLng = coords[0][0], maxLng = coords[0][0];
          let minLat = coords[0][1], maxLat = coords[0][1];
          coords.forEach(([lng, lat]: [number, number]) => {
            minLng = Math.min(minLng, lng); maxLng = Math.max(maxLng, lng);
            minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
          });
          ctx.map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 50, maxZoom: 18 });
        }

        if (onClose) onClose();
      } else {
        Swal.fire('Tidak Ditemukan', 'Data tidak ditemukan', 'info');
      }
    } catch (error) {
      console.error('Search error:', error);
      Swal.fire('Error!', 'Terjadi kesalahan pencarian', 'error');
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
              onChange={(e) => setSearchType(e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            NOP
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input 
              type="radio" 
              name="searchType" 
              value="Nama" 
              checked={searchType === 'Nama'}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            Nama
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input 
              type="radio" 
              name="searchType" 
              value="Alamat" 
              checked={searchType === 'Alamat'}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            Alamat
          </label>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder={searchType === 'NOP' ? 'Masukkan NOP (contoh: 357504000801300120)' : `Masukkan ${searchType}...`}
            className="flex-1 px-3 py-2 border border-emerald-500 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-gray-800 text-sm placeholder:text-gray-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-70"
          >
            <Search size={16} />
            Cari
          </button>
        </form>
      </div>
    </div>
  );
}

