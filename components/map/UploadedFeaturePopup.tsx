'use client';

import React, { useState } from 'react';
import { X, Layers, ChevronLeft, ChevronRight, Search, Copy, Check, ExternalLink } from 'lucide-react';

export interface UploadedFeatureItem {
  id: string;
  layerId: string;
  layerName: string;
  layerColor: string;
  geometryType: string;
  properties: Record<string, any>;
  geometry: any;
}

interface UploadedFeaturePopupProps {
  features: UploadedFeatureItem[];
  initialIndex?: number;
  initialViewMode?: 'single' | 'all';
  onSelectFeature?: (feature: UploadedFeatureItem, index: number) => void;
  onClose?: () => void;
}

export function UploadedFeaturePopup({
  features,
  initialIndex = 0,
  initialViewMode = 'single',
  onSelectFeature,
  onClose,
}: UploadedFeaturePopupProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [viewMode, setViewMode] = useState<'single' | 'all'>(
    features.length > 1 ? initialViewMode : 'single'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeFeature = features[currentIndex] || features[0];

  const handleSelectIndex = (idx: number) => {
    setCurrentIndex(idx);
    setViewMode('single');
    onSelectFeature?.(features[idx], idx);
  };

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + features.length) % features.length;
    handleSelectIndex(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % features.length;
    handleSelectIndex(nextIdx);
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const renderValue = (val: any, uniqueKey: string) => {
    if (val === null || val === undefined) {
      return <span className="text-gray-400 italic text-[11px]">-</span>;
    }

    if (typeof val === 'boolean') {
      return (
        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${val ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {val ? 'TRUE' : 'FALSE'}
        </span>
      );
    }

    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);

    // Check if URL
    if (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'))) {
      return (
        <a
          href={val}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 hover:text-emerald-700 underline text-xs inline-flex items-center gap-1 break-all"
        >
          {val}
          <ExternalLink size={11} className="shrink-0" />
        </a>
      );
    }

    return (
      <div className="flex items-center justify-between group/val gap-1">
        <span className="text-gray-800 text-xs break-all leading-snug font-medium select-text">
          {str}
        </span>
        <button
          type="button"
          onClick={() => copyToClipboard(str, uniqueKey)}
          className="opacity-0 group-hover/val:opacity-100 transition-opacity p-0.5 text-gray-400 hover:text-gray-600 shrink-0"
          title="Salin nilai"
        >
          {copiedKey === uniqueKey ? (
            <Check size={12} className="text-emerald-600" />
          ) : (
            <Copy size={12} />
          )}
        </button>
      </div>
    );
  };

  const renderPropertyTable = (properties: Record<string, any>, prefix = '') => {
    const entries = Object.entries(properties);

    if (entries.length === 0) {
      return (
        <div className="py-4 text-center text-xs text-gray-400 italic">
          Tidak ada atribut data (properties kosong)
        </div>
      );
    }

    const filtered = entries.filter(([k, v]) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
      return (
        <div className="py-3 text-center text-xs text-gray-400">
          Tidak ada atribut yang cocok dengan "{searchQuery}"
        </div>
      );
    }

    return (
      <div className="border border-gray-100 rounded-lg overflow-hidden divide-y divide-gray-100 text-xs">
        {filtered.map(([k, v], idx) => {
          const uniqueKey = `${prefix}_${k}_${idx}`;
          return (
            <div
              key={uniqueKey}
              className={`p-2 flex flex-col gap-0.5 transition-colors ${idx % 2 === 0 ? 'bg-gray-50/70' : 'bg-white'} hover:bg-emerald-50/40`}
            >
              <div className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">
                {k}
              </div>
              <div>{renderValue(v, uniqueKey)}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-[320px] sm:w-[360px] bg-white rounded-xl shadow-xl overflow-hidden font-sans border border-gray-100 text-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3.5 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center shrink-0">
            <Layers size={14} className="text-white" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold leading-tight truncate">
              {features.length > 1
                ? `Informasi Objek (${features.length} Tumpuk)`
                : 'Informasi Objek Layer'}
            </h4>
            <p className="text-[10px] text-emerald-100 truncate">
              {features.length > 1
                ? 'Terdapat beberapa fitur di titik ini'
                : activeFeature?.layerName}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-md hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition-colors shrink-0 ml-1"
            title="Tutup"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Tabs / Switcher if features overlap (features.length > 1) */}
      {features.length > 1 && (
        <div className="bg-gray-50 border-b border-gray-200 px-2 py-1.5 flex items-center justify-between gap-1">
          {/* Prev button */}
          <button
            type="button"
            onClick={handlePrev}
            className="p-1 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-30 transition-colors"
            title="Objek sebelumnya"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Feature list pills */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar flex-1 justify-center">
            {features.map((feat, idx) => {
              const isSelected = viewMode === 'single' && currentIndex === idx;
              return (
                <button
                  key={feat.id || idx}
                  type="button"
                  onClick={() => handleSelectIndex(idx)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                  title={`${feat.layerName} (${idx + 1}/${features.length})`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0 border border-white/60"
                    style={{ backgroundColor: feat.layerColor }}
                  />
                  <span>
                    Objek {idx + 1}
                  </span>
                </button>
              );
            })}

            {/* View All Pill */}
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap shrink-0 ${
                viewMode === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
              }`}
              title="Lihat semua data bertumpuk sekaligus"
            >
              Semua ({features.length})
            </button>
          </div>

          {/* Next button */}
          <button
            type="button"
            onClick={handleNext}
            className="p-1 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-30 transition-colors"
            title="Objek selanjutnya"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-3">
        {/* Search filter if more than 5 properties in single mode */}
        {viewMode === 'single' &&
          Object.keys(activeFeature?.properties || {}).length > 5 && (
            <div className="relative mb-2.5">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Cari atribut atau nilai..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          )}

        {/* View Mode: SINGLE feature */}
        {viewMode === 'single' && activeFeature && (
          <div>
            {/* Layer Info Badge */}
            <div className="flex items-center justify-between gap-2 p-2 bg-emerald-50/60 border border-emerald-100 rounded-lg mb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0 border border-white shadow-xs"
                  style={{ backgroundColor: activeFeature.layerColor }}
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-emerald-950 truncate leading-tight">
                    {activeFeature.layerName}
                  </div>
                  <div className="text-[10px] text-emerald-700 leading-tight">
                    Tipe: {activeFeature.geometryType}
                  </div>
                </div>
              </div>
              {features.length > 1 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-200/60 text-emerald-800 font-semibold shrink-0">
                  {currentIndex + 1} / {features.length}
                </span>
              )}
            </div>

            {/* Properties List */}
            <div className="max-h-56 overflow-y-auto pr-0.5 space-y-1">
              {renderPropertyTable(activeFeature.properties, `single_${currentIndex}`)}
            </div>
          </div>
        )}

        {/* View Mode: ALL features (Stacked view showing both) */}
        {viewMode === 'all' && (
          <div className="max-h-72 overflow-y-auto pr-0.5 space-y-3 divide-y divide-gray-100">
            {features.map((feat, idx) => (
              <div key={feat.id || idx} className={idx > 0 ? 'pt-3' : ''}>
                {/* Layer header */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-white shadow-xs"
                      style={{ backgroundColor: feat.layerColor }}
                    />
                    <span className="text-xs font-bold text-gray-800 truncate">
                      {feat.layerName}
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium shrink-0">
                    Objek #{idx + 1} ({feat.geometryType})
                  </span>
                </div>

                {/* Table for this feature */}
                {renderPropertyTable(feat.properties, `all_${idx}`)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-500 flex items-center justify-between">
        <span>
          {viewMode === 'single'
            ? `${Object.keys(activeFeature?.properties || {}).length} atribut data`
            : `${features.length} objek bertumpuk`}
        </span>
        {features.length > 1 && viewMode === 'single' && (
          <span className="text-emerald-700 font-medium">
            Gunakan tombol/tab untuk beralih objek
          </span>
        )}
      </div>
    </div>
  );
}

