'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, AlertCircle, Compass, Loader2, ExternalLink } from 'lucide-react';
import { PegmanIcon } from '@/components/icons/PegmanIcon';

interface StreetViewModalProps {
  coords: {
    lat: number;
    lng: number;
    title?: string;
    targetLat?: number;
    targetLng?: number;
    initialHeading?: number;
  };
  onClose: () => void;
}

import { loadGoogleMapsScript } from '@/lib/streetview';

function getCardinalDirection(h: number): string {
  const norm = ((h % 360) + 360) % 360;
  if (norm >= 337.5 || norm < 22.5) return 'Utara (U)';
  if (norm >= 22.5 && norm < 67.5) return 'Timur Laut (TL)';
  if (norm >= 67.5 && norm < 112.5) return 'Timur (T)';
  if (norm >= 112.5 && norm < 157.5) return 'Tenggara (TG)';
  if (norm >= 157.5 && norm < 202.5) return 'Selatan (S)';
  if (norm >= 202.5 && norm < 247.5) return 'Barat Daya (BD)';
  if (norm >= 247.5 && norm < 292.5) return 'Barat (B)';
  return 'Barat Laut (BL)';
}

export function StreetViewModal({ coords, onClose }: StreetViewModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noCoverage, setNoCoverage] = useState(false);
  const [heading, setHeading] = useState<number>(0);
  const [pitch, setPitch] = useState<number>(0);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDNC33SroGZ6S4dklZsuwA6B7Ze9zmZous';

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!apiKey) {
      setErrorMsg('API Key Google Maps belum disetel di .env.local');
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setErrorMsg(null);
    setNoCoverage(false);

    loadGoogleMapsScript(apiKey)
      .then(async (maps) => {
        if (!isMounted || !containerRef.current) return;

        const { lat, lng } = coords;
        const targetLatLng = new maps.LatLng(lat, lng);
        const svService = new maps.StreetViewService();

        // Progressive search tiers with StreetViewPreference.NEAREST
        // Prevents jumping to major roads across the block!
        const searchTiers = [
          { radius: 35, outdoor: true },
          { radius: 65, outdoor: true },
          { radius: 95, outdoor: true },
          { radius: 55, outdoor: false },
          { radius: 95, outdoor: false },
        ];

        const queryTier = (tier: { radius: number; outdoor: boolean }): Promise<any> => {
          return new Promise((resolve) => {
            const req: any = {
              location: targetLatLng,
              radius: tier.radius,
              preference: maps.StreetViewPreference ? maps.StreetViewPreference.NEAREST : 'nearest',
            };
            if (tier.outdoor && maps.StreetViewSource?.OUTDOOR) {
              req.source = maps.StreetViewSource.OUTDOOR;
            }
            svService.getPanorama(req, (data: any, status: any) => {
              if (status === maps.StreetViewStatus.OK && data?.location?.pano && data?.location?.latLng) {
                resolve(data);
              } else {
                resolve(null);
              }
            });
          });
        };

        let foundData: any = null;
        for (const tier of searchTiers) {
          foundData = await queryTier(tier);
          if (foundData) break;
        }

        if (!isMounted || !containerRef.current) return;

        if (foundData && foundData.location?.pano) {
          setNoCoverage(false);
          setLoading(false);

          // Compute heading facing from camera towards target parcel
          let initialHeading = coords.initialHeading ?? 180;
          const targetLat = coords.targetLat ?? coords.lat;
          const targetLng = coords.targetLng ?? coords.lng;
          if (foundData.location.latLng && maps.geometry?.spherical?.computeHeading) {
            const targetPt = new maps.LatLng(targetLat, targetLng);
            initialHeading = Math.round(maps.geometry.spherical.computeHeading(foundData.location.latLng, targetPt));
            initialHeading = ((initialHeading % 360) + 360) % 360;
          }

          // Initialize or update StreetViewPanorama
          if (!panoramaRef.current) {
            const pano = new maps.StreetViewPanorama(containerRef.current, {
              pano: foundData.location.pano,
              pov: {
                heading: initialHeading,
                pitch: 0,
              },
              zoom: 1,
              addressControl: true,
              showRoadLabels: true,
              motionTracking: false,
              motionTrackingControl: false,
              fullscreenControl: false,
            });
            panoramaRef.current = pano;
            setHeading(initialHeading);
            setPitch(0);

            // Listen to POV rotation changes to update North compass needle in real-time
            pano.addListener('pov_changed', () => {
              const currentPov = pano.getPov();
              if (currentPov) {
                setHeading(Math.round(currentPov.heading || 0));
                setPitch(Math.round(currentPov.pitch || 0));
              }
            });

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
          } else {
            panoramaRef.current.setPano(foundData.location.pano);
            panoramaRef.current.setPov({ heading: initialHeading, pitch: 0 });
            panoramaRef.current.setVisible(true);
            setHeading(initialHeading);
            setPitch(0);
          }
        } else {
          setNoCoverage(true);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        console.error('Failed to load Google Maps SDK:', err);
        if (isMounted) {
          setErrorMsg('Gagal memuat Google Maps SDK: ' + (err.message || 'Periksa koneksi internet'));
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [coords.lat, coords.lng, coords.targetLat, coords.targetLng, coords.initialHeading, apiKey]);

  // Handle window resize for panorama
  useEffect(() => {
    const handleResize = () => {
      if (panoramaRef.current && (window as any).google?.maps?.event) {
        (window as any).google.maps.event.trigger(panoramaRef.current, 'resize');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const directGoogleMapsUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${coords.lat},${coords.lng}`;

  const handleResetNorth = () => {
    if (panoramaRef.current) {
      panoramaRef.current.setPov({
        heading: 0,
        pitch: pitch || 0,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] w-screen h-screen flex flex-col bg-black text-white overflow-hidden animate-in fade-in duration-200">
      {/* Header Bar - Above everything with full width */}
      <div className="bg-gray-900/95 backdrop-blur-md px-4 sm:px-6 py-2.5 border-b border-gray-800 flex items-center justify-between text-white shrink-0 z-20 shadow-xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <PegmanIcon className="w-5 h-5 fill-current" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2 truncate">
              Google Street View 360°
              {coords.title && (
                <span className="text-xs font-medium text-amber-300 bg-amber-950/70 border border-amber-600/40 px-2.5 py-0.5 rounded-full">
                  {coords.title}
                </span>
              )}
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-400 font-mono truncate">
              Koordinat: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Direct Link External Fallback */}
          <a
            href={directGoogleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors flex items-center gap-1.5 text-xs border border-gray-700/60"
            title="Buka langsung di Web Google Maps"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">Buka Google Maps</span>
          </a>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer border border-red-500/50"
            title="Tutup (ESC)"
          >
            <X size={15} />
            <span>Tutup (ESC)</span>
          </button>
        </div>
      </div>

      {/* Street View Container Body - 100% Full Viewport */}
      <div className="relative flex-1 w-full h-full bg-black overflow-hidden streetview-container">
        {/* Sembunyikan popup error dan watermark 'For development purposes only' */}
        <style>{`
          .streetview-container .gm-err-container,
          .streetview-container .gm-err-content,
          .streetview-container .gm-err-icon,
          .streetview-container .gm-err-title,
          .streetview-container .gm-err-message,
          .streetview-container .dismissButton,
          .streetview-container .gm-style-pbc,
          .streetview-container div:has(> .gm-err-container),
          .streetview-container div:has(> .dismissButton),
          .streetview-container div[style*="z-index: 1000001"],
          .streetview-container div[style*="z-index: 1000000"],
          .streetview-container div[aria-label="Google Maps Error"],
          .streetview-container div[aria-label="Kesalahan Google Maps"] {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
          }
          .streetview-container div[style*="For development purposes only"] {
            display: none !important;
            opacity: 0 !important;
          }
        `}</style>

        {/* Main Panorama DOM Element */}
        <div
          ref={containerRef}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Floating North Compass in Street View */}
        {!loading && !noCoverage && !errorMsg && (
          <div className="absolute top-4 right-4 z-20 flex flex-col items-center">
            <button
              type="button"
              onClick={handleResetNorth}
              className="group relative flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-gray-900/90 hover:bg-gray-800 active:scale-95 text-white shadow-2xl backdrop-blur-md border border-white/20 transition-all cursor-pointer select-none"
              title="Arah Hadap Kamera (Klik untuk reset hadap Utara)"
            >
              {/* Dial with rotating needle */}
              <div
                className="relative w-12 h-12 flex items-center justify-center transition-transform duration-100 ease-out"
                style={{ transform: `rotate(${-heading}deg)` }}
              >
                <svg viewBox="0 0 48 48" className="w-12 h-12 drop-shadow-md">
                  {/* Outer circle & rim */}
                  <circle cx="24" cy="24" r="22" fill="#111827" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

                  {/* Cardinal tick marks */}
                  <line x1="24" y1="3" x2="24" y2="7" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="24" y1="41" x2="24" y2="45" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="3" y1="24" x2="7" y2="24" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="41" y1="24" x2="45" y2="24" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />

                  {/* North Needle (Red arrow pointing up with 'U') */}
                  <polygon points="24,6 29,22 19,22" fill="#ef4444" />
                  <text x="24" y="15" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold" fontFamily="system-ui, sans-serif">U</text>

                  {/* South Needle (Silver/gray arrow pointing down with 'S') */}
                  <polygon points="24,42 29,26 19,26" fill="#9ca3af" />
                  <text x="24" y="37" textAnchor="middle" fill="#111827" fontSize="6.5" fontWeight="bold" fontFamily="system-ui, sans-serif">S</text>

                  {/* Center pin */}
                  <circle cx="24" cy="24" r="2.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                </svg>
              </div>

              {/* Degrees & Cardinal Direction */}
              <div className="flex flex-col items-center leading-none px-1">
                <span className="text-xs font-mono font-bold text-amber-400">
                  {((heading % 360) + 360) % 360}°
                </span>
                <span className="text-[10px] font-semibold text-gray-200 mt-0.5">
                  {getCardinalDirection(heading)}
                </span>
              </div>

              {/* Hover tooltip hint */}
              <div className="absolute top-full mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-amber-300 text-[10px] font-medium px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap border border-white/10">
                Klik untuk reset hadap Utara (0°)
              </div>
            </button>
          </div>
        )}

          {/* Loading Indicator */}
          {loading && (
            <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white z-10">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-medium">Memuat Google Street View...</p>
                <p className="text-xs text-gray-400 mt-1">Mencari titik panorama terdekat di lokasi ini</p>
              </div>
            </div>
          )}

          {/* No Coverage Notice */}
          {!loading && noCoverage && (
            <div className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center p-6 text-center text-white z-10">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <Compass className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-gray-100 mb-1">
                Street View Tidak Tersedia di Titik Ini
              </h4>
              <p className="text-xs text-gray-400 max-w-md mb-6 leading-relaxed">
                Mobil Google Street View belum merekam foto 360° pada radius 150 meter dari koordinat ini (biasanya di dalam gang sempit, lahan kosong, atau tengah sawah).
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold rounded-lg transition-colors border border-gray-700"
                >
                  Tutup
                </button>
                <a
                  href={directGoogleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <ExternalLink size={14} />
                  Buka di Google Maps
                </a>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {!loading && errorMsg && (
            <div className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center p-6 text-center text-white z-10">
              <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-gray-100 mb-1">
                Gagal Memuat Street View
              </h4>
              <p className="text-xs text-red-300 max-w-md mb-6">{errorMsg}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold rounded-lg transition-colors border border-gray-700"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
