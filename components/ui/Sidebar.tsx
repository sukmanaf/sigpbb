'use client';

import { useContext } from 'react';
import { MapContext } from '@/components/providers/MapProvider';
import { useNopDetail } from '@/hooks/useNopDetail';
import { formatArea } from '@/lib/utils';

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value ?? '-'}</span>
    </div>
  );
}

export function Sidebar() {
  const ctx = useContext(MapContext);
  if (!ctx) return null;

  const { selectedNop, setSelectedNop, selectedDesa, selectedDesaName, mode, setMode } = ctx;
  const { data: nopDetail, isLoading } = useNopDetail(selectedNop);

  const canEdit = !!selectedDesa;

  return (
    <div className={`sidebar ${selectedNop || selectedDesa ? 'sidebar-open' : ''}`}>
      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === 'view' ? 'mode-btn-active-view' : ''}`}
          onClick={() => setMode('view')}
        >
          👁️ View
        </button>
        <button
          className={`mode-btn ${mode === 'edit' ? 'mode-btn-active-edit' : ''}`}
          onClick={() => setMode('edit')}
          disabled={!canEdit}
          title={!canEdit ? 'Pilih desa dulu' : 'Switch to Edit Mode'}
        >
          ✏️ Edit
        </button>
      </div>

      {selectedDesa && (
        <div className="desa-info">
          <div className="desa-info-header">
            <span className="desa-icon">🏘️</span>
            <div>
              <p className="desa-name">{selectedDesaName || selectedDesa}</p>
              <p className="desa-code">{selectedDesa}</p>
            </div>
          </div>
        </div>
      )}

      {!selectedNop && !selectedDesa && (
        <div className="sidebar-empty">
          <p>🗺️</p>
          <p>Klik desa di peta untuk memulai</p>
        </div>
      )}

      {/* NOP Detail is now handled by NopInfoModal component */}
    </div>
  );
}
