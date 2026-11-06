'use client';

import React, { useEffect, useRef, useState, useContext } from 'react';
import { MapContext } from '@/components/providers/MapProvider';
import { loadGoogleMapsScript, checkStreetViewCoverage, StreetViewCoverageResult } from '@/lib/streetview';
import { Compass, ExternalLink, Loader2, Maximize2 } from 'lucide-react';

interface StreetViewThumbnailProps {
  lat: number;
  lng: number;
  title?: string;
  onOpen?: () => void;
  className?: string;
  variant?: 'thumbnail' | 'card';
}

export function StreetViewThumbnail({
  lat,
  lng,
  title,
  onOpen,
  className = '',
  variant = 'thumbnail',
}: StreetViewThumbnailProps) {
  const ctx = useContext(MapContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const panoInstanceRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [coverage, setCoverage] = useState<StreetViewCoverageResult | null>(null);

  // Check if street view coverage exists near these coordinates
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setCoverage(null);

    checkStreetViewCoverage(lat, lng, 85).then((res) => {
      if (!isMounted) return;
      setCoverage(res);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [lat, lng]);

  // Mount mini panorama preview once coverage is confirmed
  useEffect(() => {
    if (!coverage?.available || !containerRef.current) return;

    let isMounted = true;
    loadGoogleMapsScript().then((maps) => {
      if (!isMounted || !containerRef.current) return;

      try {
        const panorama = new maps.StreetViewPanorama(containerRef.current, {
          pano: coverage.pano,
          pov: { heading: coverage.heading || 0, pitch: 0 },
          zoom: 0,
          disableDefaultUI: true,
          showRoadLabels: false,
          clickToGo: false,
          scrollwheel: false,
          draggable: false,
          disableDoubleClickZoom: true,
          keyboardShortcuts: false,
          panControl: false,
          zoomControl: false,
          addressControl: false,
          fullscreenControl: false,
          motionTracking: false,
          motionTrackingControl: false,
        });

        panoInstanceRef.current = panorama;

        // Auto-dismiss and suppress error popup and gray backdrop
        const observer = new MutationObserver(() => {
          if (!containerRef.current) return;
          const errorBoxes = containerRef.current.querySelectorAll(
            '.gm-err-container, .dismissButton, .gm-style-pbc, div[style*="z-index: 100000"]'
          );
          errorBoxes.forEach((el) => {
            const htmlEl = el as HTMLElement;
            htmlEl.style.display = 'none';
            htmlEl.style.opacity = '0';
            htmlEl.style.pointerEvents = 'none';

            if (htmlEl.classList.contains('dismissButton')) {
              try {
                htmlEl.click();
              } catch {}
            }

            const parent = htmlEl.parentElement;
            if (parent && parent !== containerRef.current && (parent.style.position === 'absolute' || parent.style.zIndex.length > 4)) {
              parent.style.display = 'none';
            }
          });
        });

        if (containerRef.current) {
          observer.observe(containerRef.current, { childList: true, subtree: true });
        }

        // Force a resize check in case container dimensions initialized late
        setTimeout(() => {
          if (isMounted && panorama && maps.event) {
            maps.event.trigger(panorama, 'resize');
          }
        }, 150);
      } catch (err) {
        console.error('Failed to initialize mini StreetView thumbnail', err);
      }
    });

    return () => {
      isMounted = false;
      if (panoInstanceRef.current) {
        panoInstanceRef.current = null;
      }
    };
  }, [coverage]);

  // If loading or not available, do not display anything
  if (loading || !coverage?.available) {
    return null;
  }

  const handleOpen = () => {
    if (onOpen) {
      onOpen();
      return;
    }
    if (coverage?.latLng) {
      ctx?.setActiveStreetViewCoords({
        lat: coverage.latLng.lat,
        lng: coverage.latLng.lng,
        title: title || 'Google Street View 360°',
        targetLat: lat,
        targetLng: lng,
        initialHeading: coverage.heading,
      });
    }
  };

  // Thumbnail Only View (identical to the circular element in Google Maps mobile)
  const thumbnailElement = (
    <div
      onClick={handleOpen}
      className={`group relative rounded-2xl overflow-hidden border-2 border-white/80 shadow-lg cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-95 hover:shadow-xl bg-gray-900 select-none streetview-thumb-container ${className || 'w-36 h-24 sm:w-44 sm:h-28'}`}
      title="Buka Google Street View 360°"
    >
      <style>{`
        .streetview-thumb-container .gm-err-container,
        .streetview-thumb-container .gm-err-content,
        .streetview-thumb-container .gm-err-icon,
        .streetview-thumb-container .gm-err-title,
        .streetview-thumb-container .gm-err-message,
        .streetview-thumb-container .dismissButton,
        .streetview-thumb-container .gm-style-pbc,
        .streetview-thumb-container div:has(> .gm-err-container),
        .streetview-thumb-container div:has(> .dismissButton),
        .streetview-thumb-container div[style*="z-index: 1000001"],
        .streetview-thumb-container div[style*="z-index: 1000000"],
        .streetview-thumb-container div[aria-label="Google Maps Error"],
        .streetview-thumb-container div[aria-label="Kesalahan Google Maps"] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        .streetview-thumb-container div[style*="For development purposes only"] {
          display: none !important;
          opacity: 0 !important;
        }
      `}</style>

      {/* Mini Panorama Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full pointer-events-none transition-transform duration-300 group-hover:scale-105"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Hover Darken Overlay */}
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors pointer-events-none" />

      {/* 360° Circular Arrow Badge in Bottom-Left (identical to Google Maps mobile) */}
      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs rounded-full p-1.5 shadow-md flex items-center justify-center text-white border border-white/30 group-hover:bg-black/80 group-hover:scale-110 transition-all pointer-events-none">
        <svg
          className="w-4 h-4 text-white drop-shadow-sm transition-transform duration-300 group-hover:-rotate-45"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.83 6.72 2.24" />
          <polyline points="21 3 21 8 16 8" />
        </svg>
      </div>

      {/* Hover Expand Hint in Top-Right */}
      <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-xs text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <Maximize2 size={12} />
      </div>
    </div>
  );

  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-3.5 text-white flex items-center gap-4 border border-slate-700/80 shadow-md mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="shrink-0">
          {thumbnailElement}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Compass size={14} />
            <span>Street View 360° Tersedia</span>
          </div>
          <h4 className="text-sm font-bold text-white mt-0.5 truncate">
            {title || 'Tampilan Jalan Sekitar'}
          </h4>
          <p className="text-xs text-gray-300 mt-1 leading-relaxed line-clamp-2">
            Jalan di depan/sekitar bidang tanah ini terekam Google Street View. Klik foto di samping untuk melihat pemandangan 360°.
          </p>
          <button
            onClick={handleOpen}
            className="mt-2.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-gray-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Maximize2 size={13} />
            <span>Buka Layar Penuh (360°)</span>
          </button>
        </div>
      </div>
    );
  }

  return thumbnailElement;
}

