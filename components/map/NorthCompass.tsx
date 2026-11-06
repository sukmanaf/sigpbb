'use client';

import React, { useEffect, useState, useContext } from 'react';
import { MapContext } from '@/components/providers/MapProvider';

export function NorthCompass() {
  const ctx = useContext(MapContext);
  const map = ctx?.map;
  const [bearing, setBearing] = useState(0);
  const [pitch, setPitch] = useState(0);

  useEffect(() => {
    if (!map) return;

    const updateOrientation = () => {
      setBearing(Math.round(map.getBearing()));
      setPitch(Math.round(map.getPitch()));
    };

    updateOrientation();

    map.on('rotate', updateOrientation);
    map.on('pitch', updateOrientation);

    return () => {
      map.off('rotate', updateOrientation);
      map.off('pitch', updateOrientation);
    };
  }, [map]);

  const handleResetNorth = () => {
    if (!map) return;
    map.easeTo({
      bearing: 0,
      pitch: 0,
      duration: 600,
    });
  };

  const isRotated = bearing !== 0 || pitch !== 0;

  return (
    <button
      onClick={handleResetNorth}
      className={`relative w-10 h-10 bg-white rounded-lg shadow-md border transition-all duration-200 flex flex-col items-center justify-center cursor-pointer group active:scale-95 ${
        isRotated
          ? 'border-red-400 ring-2 ring-red-400/40 bg-red-50/20'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      title={
        isRotated
          ? `Rotasi: ${bearing}° • Klik untuk reset ke Arah Utara`
          : 'Kompas Arah Utara (Klik untuk reset Utara)'
      }
    >
      {/* Compass Needle Container with real-time rotation */}
      <div
        className="relative w-7 h-7 flex items-center justify-center transition-transform duration-100 ease-out"
        style={{
          transform: `rotate(${-bearing}deg)`,
        }}
      >
        <svg
          viewBox="0 0 32 32"
          className="w-full h-full drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer dotted ring */}
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="#cbd5e1"
            strokeWidth="1.2"
            strokeDasharray="2 2"
          />

          {/* North Pointer (Red) */}
          <polygon
            points="16,3 12.5,16 16,13.5"
            fill="#dc2626"
            className="transition-colors group-hover:fill-red-500"
          />
          <polygon
            points="16,3 19.5,16 16,13.5"
            fill="#ef4444"
            className="transition-colors group-hover:fill-red-400"
          />

          {/* South Pointer (Dark/Silver) */}
          <polygon
            points="16,29 12.5,16 16,18.5"
            fill="#94a3b8"
            className="transition-colors group-hover:fill-slate-400"
          />
          <polygon
            points="16,29 19.5,16 16,18.5"
            fill="#64748b"
            className="transition-colors group-hover:fill-slate-500"
          />

          {/* Center Pin */}
          <circle cx="16" cy="16" r="2.5" fill="#ffffff" stroke="#475569" strokeWidth="1" />
        </svg>

        {/* Bold "U" (Utara) Label at North Peak */}
        <span
          className="absolute -top-1.5 font-black text-[9px] text-red-600 select-none tracking-tighter drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]"
        >
          U
        </span>
      </div>

      {/* Degree badge if rotated */}
      {isRotated && (
        <span className="absolute -bottom-1 text-[8px] font-extrabold text-red-600 bg-white px-1 rounded-full shadow-xs border border-red-200 scale-90">
          {bearing}°
        </span>
      )}
    </button>
  );
}

