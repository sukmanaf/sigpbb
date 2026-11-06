'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';

interface FloatingPegmanProps {
  isActive: boolean;
  onCancel: () => void;
}

export function FloatingPegman({ isActive, onCancel }: FloatingPegmanProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [tilt, setTilt] = useState(0);
  const lastXRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      setPos(null);
      setTilt(0);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = Math.max(16, now - lastTimeRef.current);
      
      if (lastXRef.current !== null) {
        const dx = e.clientX - lastXRef.current;
        const velocity = (dx / dt) * 15;
        // Clamp tilt angle between -22 and 22 degrees
        const targetTilt = Math.max(-22, Math.min(22, velocity));
        setTilt(targetTilt);
      }

      lastXRef.current = e.clientX;
      lastTimeRef.current = now;
      setPos({ x: e.clientX, y: e.clientY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      setPos({ x: touch.clientX, y: touch.clientY });
    };

    // Slowly return tilt back to 0 when idle
    const decayTilt = () => {
      setTilt((prev) => {
        if (Math.abs(prev) < 0.5) return 0;
        return prev * 0.85;
      });
      animationFrameRef.current = requestAnimationFrame(decayTilt);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    animationFrameRef.current = requestAnimationFrame(decayTilt);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isActive]);

  if (!isActive || !pos) return null;

  return (
    <>
      {/* Top Banner Guide */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[2100] pointer-events-auto flex items-center gap-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-5 py-2.5 rounded-full shadow-2xl border border-amber-300 animate-in fade-in slide-in-from-top-4">
        <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-ping shrink-0" />
        <span className="text-xs sm:text-sm font-semibold tracking-wide drop-shadow-xs">
          Arahkan atau Lepas orang ke garis biru jalan untuk melihat Street View
        </span>
        <button
          onClick={onCancel}
          className="ml-2 px-3 py-1 bg-black/25 hover:bg-black/40 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
          title="Batal (ESC)"
        >
          <X size={13} />
          Batal (ESC)
        </button>
      </div>

      {/* Floating Pegman doll following mouse */}
      <div
        className="fixed pointer-events-none z-[2200] transition-transform duration-75 ease-out select-none"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transform: `translate(-50%, -75%) rotate(${tilt}deg)`,
          transformOrigin: '50% 20%',
        }}
      >
        <div className="relative flex flex-col items-center">
          {/* Animated 3D-styled Google Pegman Character */}
          <div className="relative drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
            <svg
              width="44"
              height="58"
              viewBox="0 0 44 58"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="filter drop-shadow-md"
            >
              {/* Pegman Head */}
              <circle cx="22" cy="11" r="7.5" fill="#F4B400" stroke="#B45309" strokeWidth="1" />
              {/* Head Highlight */}
              <circle cx="20" cy="9" r="3" fill="#FDE68A" opacity="0.8" />
              {/* Neck Collar */}
              <path d="M18 18 H26 V21 H18 Z" fill="#D97706" />

              {/* Pegman Torso */}
              <path
                d="M14 21 C14 19 16 18 22 18 C28 18 30 19 30 21 L31 38 C31 40 29 41 22 41 C15 41 13 40 13 38 Z"
                fill="#F59E0B"
                stroke="#B45309"
                strokeWidth="1"
              />
              {/* Torso front detail / shading */}
              <path d="M17 22 H27 L26 39 H18 Z" fill="#FBBF24" />

              {/* Left Arm (waving/dangling) */}
              <path
                d="M13 21 C11 23 8 27 7 34 C6 37 9 39 10 36 C11 32 13 26 15 23 Z"
                fill="#F59E0B"
                stroke="#B45309"
                strokeWidth="0.8"
              />
              {/* Right Arm */}
              <path
                d="M31 21 C33 23 36 27 37 34 C38 37 35 39 34 36 C33 32 31 26 29 23 Z"
                fill="#F59E0B"
                stroke="#B45309"
                strokeWidth="0.8"
              />

              {/* Left Leg */}
              <path
                d="M16 41 L15 52 C15 54 18 55 19 53 L20 41 Z"
                fill="#D97706"
                stroke="#92400E"
                strokeWidth="0.8"
              />
              {/* Left Shoe */}
              <ellipse cx="16.5" cy="53.5" rx="3.5" ry="2" fill="#78350F" />

              {/* Right Leg */}
              <path
                d="M24 41 L25 52 C25 54 28 55 29 53 L28 41 Z"
                fill="#D97706"
                stroke="#92400E"
                strokeWidth="0.8"
              />
              {/* Right Shoe */}
              <ellipse cx="27.5" cy="53.5" rx="3.5" ry="2" fill="#78350F" />
            </svg>
          </div>

          {/* Target Reticle / Cyan Drop Ring on Road Surface */}
          <div className="absolute top-[52px] flex items-center justify-center">
            {/* Pulsing Outer Ring */}
            <div className="w-9 h-9 rounded-full border-2 border-cyan-400 bg-cyan-400/20 shadow-[0_0_12px_rgba(6,182,212,0.9)] animate-ping opacity-60" />
            {/* Solid Center Ring */}
            <div className="absolute w-6 h-6 rounded-full border-2 border-white bg-cyan-500/70 shadow-[0_0_10px_rgba(6,182,212,1)] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

