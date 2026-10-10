'use client';

import Link from 'next/link';
import { Pencil, Layers, ChevronDown, LogOut, Users, Key, User, Menu, X, MessageSquarePlus, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const tematikItems = [
  { id: 'jenis_tanah', name: 'Jenis Tanah' },
  { id: 'kelas_tanah', name: 'Kelas Tanah' },
  { id: 'jenis_bangunan', name: 'Jenis Bangunan' },
  { id: 'kelas_bangunan', name: 'Kelas Bangunan' },
];

export function Navbar() {
  const [tematikOpen, setTematikOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [appName, setAppName] = useState('SmartMap');
  
  // Dummy user for now
  const user = { username: 'admin', role: 'admin' };
  const canEdit = true;

  return (
    <nav className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md relative z-50">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                🌍
              </div>
              <span className="font-bold text-xl tracking-tight text-white">{appName}</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/map" className="px-3 py-2 rounded-lg bg-white/20 text-white font-medium flex items-center gap-2">
              <span className="text-sm">🗺️</span> Map
            </Link>

            {/* Tematik Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setTematikOpen(!tematikOpen)}
                className="px-3 py-2 rounded-lg text-emerald-50 hover:bg-white/10 font-medium flex items-center gap-2 transition-colors"
              >
                <Layers size={16} />
                Tematik
                <ChevronDown size={14} className={`transition-transform ${tematikOpen ? 'rotate-180' : ''}`} />
              </button>
              {tematikOpen && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Peta Tematik</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {tematikItems.map((item) => (
                      <button key={item.id} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative ml-2 pl-2 border-l border-emerald-500/30">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold leading-tight">{user.username}</span>
                  <span className="text-xs text-emerald-200 capitalize leading-tight">{user.role}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
              </button>
              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Key size={16} className="text-gray-400" /> Ubah Password
                  </button>
                  <div className="my-1 border-t border-gray-100"></div>
                  <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
                    <LogOut size={16} /> Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
