import { Metadata } from 'next';
import { MapProvider } from '@/components/providers/MapProvider';
import { MapView } from '@/components/map/MapView';
import { Legend } from '@/components/map/Legend';
import { MapUIOverlay } from '@/components/map/MapUIOverlay';
import { MapDrawCtrl } from '@/components/map/MapDrawCtrl';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { NopInfoModal } from '@/components/ui/NopInfoModal';
import { TematikController } from '@/components/map/TematikController';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UploadedLayerManager } from '@/components/map/UploadedLayerManager';

import { TopNavbar } from '@/components/ui/TopNavbar';

export const metadata: Metadata = {
  title: 'Peta PBB - Sistem Informasi Manajemen',
  description: 'Sistem informasi manajemen peta PBB dengan 67.328 NOP berbasis MVT dan MapLibre GL JS',
};

export default function MapPage() {
  return (
    <ProtectedRoute>
      <MapProvider>
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50">
        <TopNavbar />
        
        {/* Map Container - Remaining height */}
        <div className="flex-1 relative z-0">
          <ErrorBoundary
            fallback={
              <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500 text-sm">
                ⚠️ Gagal memuat peta. Pastikan koneksi database tersedia.
              </div>
            }
          >
            <MapView />
          </ErrorBoundary>

          {/* Drawing Tools */}
          <ErrorBoundary>
            <MapDrawCtrl />
          </ErrorBoundary>

          {/* UI Overlay (Buttons, Search, LayerControl) */}
          <MapUIOverlay />
          <TematikController />
          {process.env.NEXT_PUBLIC_FEATURE_UPLOAD_LAYER !== 'false' && (
            <UploadedLayerManager />
          )}

          {/* Legend - floating (Bottom Left) */}
          <div className="absolute bottom-8 left-4 z-10 pointer-events-none">
            <ErrorBoundary>
              <Legend />
            </ErrorBoundary>
          </div>

          {/* Modal */}
          <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
            <div className="pointer-events-auto">
              <ErrorBoundary>
                <NopInfoModal />
              </ErrorBoundary>
            </div>
          </div>
        </div>
        
      </div>
      </MapProvider>
    </ProtectedRoute>
  );
}
