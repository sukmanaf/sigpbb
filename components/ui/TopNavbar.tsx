'use client';
import { useAuth } from '@/contexts/AuthContext';


import Link from 'next/link';
import ChangePasswordModal from '@/components/ui/ChangePasswordModal';
import { Pencil, Layers, ChevronDown, Map, LogOut, Users, Key, User, Menu, X, MessageSquarePlus, Settings, FileText, Download } from 'lucide-react';
import { useState, useRef, useEffect, useContext } from 'react';
import { MapContext } from '@/components/providers/MapProvider';
import { ExportLayerModal } from '@/components/map/ExportLayerModal';
import Swal from 'sweetalert2';

const tematikItems = [
  { id: 'jenis_tanah', name: 'Jenis Tanah' },
  { id: 'kelas_tanah', name: 'Kelas Tanah' },
  { id: 'jenis_bangunan', name: 'Jenis Bangunan' },
  { id: 'kelas_bangunan', name: 'Kelas Bangunan' },
  { id: 'nilai_individu', name: 'Nilai Individu' },
  { id: 'nik', name: 'Status NIK' },
  { id: 'zona_nilai_tanah', name: 'Zona Nilai Tanah (ZNT)' },
  { id: 'ketetapan_per_buku', name: 'Ketetapan per Buku' },
  { id: 'status_pembayaran', name: 'Status Pembayaran' },
];

export function TopNavbar() {
  const ctx = useContext(MapContext);
  const [tematikOpen, setTematikOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [appName, setAppName] = useState('SmartMap');
  const [appLogo, setAppLogo] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        const data = await res.json();
        if (data.success) {
          if (data.data.app_name) setAppName(data.data.app_name);
          if (data.data.app_logo) setAppLogo(data.data.app_logo);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    }
    fetchSettings();
  }, []);
  
  const { user: currentUser, logout, canManageUsers, canEdit, canExport } = useAuth();
  const editMode = ctx?.mode === 'edit';

  return (
    <>
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

          {/* Menu */}
          <div className="flex items-center space-x-0.5 sm:space-x-1">
            <Link href="/map" className="px-2 sm:px-3 py-2 rounded-lg text-emerald-50 hover:bg-white/10 hover:text-white font-medium flex items-center gap-1.5 sm:gap-2 transition-colors">
              <Map size={18} className="sm:w-4 sm:h-4" />
              <span className="hidden md:inline">Map</span>
            </Link>

            {/* Admin Links */}
            {canManageUsers && (
              <Link href="/users" className="px-2 sm:px-3 py-2 rounded-lg text-emerald-50 hover:bg-white/10 hover:text-white font-medium flex items-center gap-1.5 sm:gap-2 transition-colors">
                <Users size={18} className="sm:w-4 sm:h-4" />
                <span className="hidden md:inline">Users</span>
              </Link>
            )}
            
            {(currentUser?.role === 'admin' || currentUser?.role === 'bapenda') && (
              <Link href="/usulan" className="px-2 sm:px-3 py-2 rounded-lg text-emerald-50 hover:bg-white/10 hover:text-white font-medium flex items-center gap-1.5 sm:gap-2 transition-colors">
                <FileText size={18} className="sm:w-4 sm:h-4" />
                <span className="hidden md:inline">Usulan</span>
              </Link>
            )}

            {canExport && (
              <button
                onClick={() => setIsExportOpen(true)}
                className="px-2 sm:px-3 py-2 rounded-lg text-emerald-50 hover:bg-white/10 hover:text-white font-medium flex items-center gap-1.5 sm:gap-2 transition-colors"
                title="Export Layer Default"
              >
                <Download size={18} className="sm:w-4 sm:h-4" />
                <span className="hidden md:inline">Export</span>
              </button>
            )}

            {/* Tematik Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  if (!ctx?.selectedDesa) {
                    Swal.fire({
                      icon: 'warning',
                      title: 'Pilih Desa',
                      text: 'Silakan pilih desa pada peta terlebih dahulu.',
                      timer: 3000,
                      showConfirmButton: false
                    });
                    return;
                  }
                  setTematikOpen(!tematikOpen);
                }}
                className={`px-2 sm:px-3 py-2 rounded-lg font-medium flex items-center gap-1.5 sm:gap-2 transition-colors ${
                   ctx?.activeTematik || tematikOpen
                     ? 'bg-white/10 text-white' 
                     : 'text-emerald-50 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Layers size={18} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">
                  {ctx?.activeTematik ? tematikItems.find(i => i.id === ctx?.activeTematik)?.name : 'Tematik'}
                </span>
                {ctx?.tematikLoading && <span className="ml-1 w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>}
                <ChevronDown size={14} className={`transition-transform ${tematikOpen ? 'rotate-180' : ''}`} />
              </button>
              {tematikOpen && (
                <div className="absolute top-full right-[-50px] sm:right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Peta Tematik</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {tematikItems.map((item) => (
                      <button 
                        key={item.id} 
                        onClick={() => {
                          if (ctx?.activeTematik === item.id) {
                            ctx?.setActiveTematik(null);
                          } else {
                            ctx?.setActiveTematik(item.id);
                          }
                          setTematikOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center gap-2 border-l-2 ${
                          ctx?.activeTematik === item.id 
                            ? 'bg-teal-50 text-teal-700 font-semibold border-teal-500' 
                            : 'text-gray-600 hover:bg-gray-50 border-transparent hover:border-gray-200'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${ctx?.activeTematik === item.id ? 'bg-teal-500' : 'bg-transparent'}`}></div>
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative ml-1 sm:ml-2 pl-1 sm:pl-2 border-l border-emerald-500/30">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-1 sm:px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-semibold leading-tight">{currentUser?.name || 'Loading...'}</span>
                  <span className="text-xs text-emerald-200 capitalize leading-tight">{currentUser?.role || ''}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <ChevronDown size={14} className={`transition-transform text-white/80 ${userMenuOpen ? 'rotate-180' : 'hidden sm:block'}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 text-gray-700 border border-gray-100 animate-in fade-in slide-in-from-top-2 z-[2000]">
                    {canManageUsers && (
                        <Link 
                            href="/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Settings size={16} />
                            Pengaturan
                        </Link>
                    )}
                    <button 
                      onClick={() => { setShowChangePassword(true); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Key size={16} />
                      Ganti Password
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 font-medium"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
      {showChangePassword && <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />}
      {canExport && <ExportLayerModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />}
    </>
  );
}
