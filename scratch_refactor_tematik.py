import re

with open('/home/wgipro/koding/newmap/my-app/components/map/TematikController.tsx', 'r') as f:
    content = f.read()

replacement = """'use client';

import { useContext, useEffect, useRef, useState, useMemo } from 'react';
import { MapContext } from '@/components/providers/MapProvider';
import Swal from 'sweetalert2';
import { getCategoryColor } from '@/lib/tematikColors';

export function TematikController() {
  const ctx = useContext(MapContext);
  const map = ctx?.map;
  
  const [showYearPopup, setShowYearPopup] = useState(false);
  
  const prevTematikRef = useRef<string | null>(null);

  const requiresYear = ['kelas_tanah', 'kelas_bangunan', 'zona_nilai_tanah', 'status_pembayaran', 'ketetapan_per_buku'];

  const yearOptions = useMemo(() => {
      const currentYear = new Date().getFullYear();
      const years: string[] = [];
      for (let y = currentYear; y >= 1990; y--) {
          years.push(y.toString());
      }
      return years;
  }, []);

  const fetchTematikData = async (activeTematik: string, selectedDesa: string, selectedYear?: string) => {
      if (!ctx || !map) return;
      const { setTematikData, setTematikLoading } = ctx;
      
      setTematikLoading(true);
      try {
        const res = await fetch(`/api/tematik/${activeTematik}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ desaKode: selectedDesa, tahun: selectedYear })
        });
        
        const json = await res.json();
        
        if (!json.success) return;
        
        const data = json.data;
        setTematikData(data);
        
        const matchExpression: any[] = ['match', ['get', 'd_nop']];
        
        Object.entries(data).forEach(([category, items]) => {
           const color = getCategoryColor(category, activeTematik);
           (items as any[]).forEach(item => {
               const nop18 = item.NOP.replace(/[.\-]/g, '');
               matchExpression.push(nop18, color);
           });
        });
        
        matchExpression.push('#ffffff');
        
        if (map.getLayer('nops-fill')) {
           map.setPaintProperty('nops-fill', 'fill-color', matchExpression);
           map.setPaintProperty('nops-fill', 'fill-opacity', 0.6);
        }

      } catch (err) {
        console.error('Tematik error:', err);
        Swal.fire('Error', 'Gagal memuat data tematik', 'error');
      } finally {
        setTematikLoading(false);
      }
  };

  useEffect(() => {
    if (!ctx || !map) return;
    const { activeTematik, selectedDesa, setTematikData, layerStyles } = ctx;

    if (!activeTematik) {
      if (prevTematikRef.current && map.getLayer('nops-fill')) {
        map.setPaintProperty('nops-fill', 'fill-color', layerStyles.nops.fillColor);
        map.setPaintProperty('nops-fill', 'fill-opacity', layerStyles.nops.fillOpacity / 100);
      }
      prevTematikRef.current = null;
      setTematikData(null);
      setShowYearPopup(false);
      return;
    }

    if (!selectedDesa) {
      Swal.fire('Perhatian!', 'Pilih desa terlebih dahulu', 'warning');
      ctx.setActiveTematik(null);
      return;
    }
    
    // If the tematik is the same as previous (e.g. they closed popup and didn't change anything),
    // don't re-trigger unless it's a new tematik.
    if (prevTematikRef.current === activeTematik) return;

    prevTematikRef.current = activeTematik;

    if (requiresYear.includes(activeTematik)) {
      setShowYearPopup(true);
    } else {
      fetchTematikData(activeTematik, selectedDesa);
    }
  }, [ctx?.activeTematik, ctx?.selectedDesa, ctx?.map]);

  const handleYearSelect = (year: string) => {
    setShowYearPopup(false);
    if (ctx?.activeTematik && ctx?.selectedDesa) {
       fetchTematikData(ctx.activeTematik, ctx.selectedDesa, year);
    }
  };

  const handleClosePopup = () => {
    setShowYearPopup(false);
    ctx?.setActiveTematik(null);
  };

  if (showYearPopup && ctx?.activeTematik) {
    return (
      <div
          className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
          <div className="bg-white rounded-xl shadow-2xl p-6 mx-4 max-w-sm w-full relative">
              <button
                  onClick={handleClosePopup}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Tutup"
              >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Pilih Tahun Pajak</h3>
              <p className="text-sm text-gray-600 mb-4">
                  Pilih tahun pajak SPPT untuk menampilkan data {ctx.activeTematik.replace(/_/g, ' ')}:
              </p>
              <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4 bg-white"
                  defaultValue=""
                  onChange={(e) => e.target.value && handleYearSelect(e.target.value)}
              >
                  <option value="" disabled>-- Pilih Tahun --</option>
                  {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                  ))}
              </select>
          </div>
      </div>
    );
  }

  return null;
}
"""

with open('/home/wgipro/koding/newmap/my-app/components/map/TematikController.tsx', 'w') as f:
    f.write(replacement)
