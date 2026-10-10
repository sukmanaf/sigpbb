'use client';

import React, { useState, useCallback, useContext } from 'react';
import { Upload, X, File, AlertCircle, Loader2 } from 'lucide-react';
import { MapContext } from '@/components/providers/MapProvider';
import { parseVectorFile } from '@/lib/parseVectorFile';

interface UploadLayerPanelProps {
  onClose: () => void;
}

export function UploadLayerPanel({ onClose }: UploadLayerPanelProps) {
  const ctx = useContext(MapContext);
  if (!ctx) return null;
  const { uploadedLayers, setUploadedLayers } = ctx;
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    try {
      const geojson = await parseVectorFile(file);
      if (!geojson) throw new Error('Data tidak valid');
      
      const geomType = await import('@/lib/parseVectorFile').then(m => m.detectGeometryType(geojson));
      
      const newLayer = {
        id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        geojson: geojson,
        type: geomType,
        opacity: 80,
        visible: true,
        color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0') // Random color
      };
      
      setUploadedLayers([...uploadedLayers, newLayer]);
      onClose(); // Optional: close panel after successful upload
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Gagal memproses file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [uploadedLayers]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [uploadedLayers]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-80 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
          <Upload size={16} className="text-emerald-500" />
          Upload Data Vektor
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2 border border-red-100">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p className="leading-tight">{error}</p>
          </div>
        )}

        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
            isDragging 
              ? 'border-emerald-500 bg-emerald-50' 
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
            {isProcessing ? (
              <Loader2 className="w-8 h-8 text-emerald-500 mb-3 animate-spin" />
            ) : (
              <Upload className={`w-8 h-8 mb-3 ${isDragging ? 'text-emerald-500' : 'text-gray-400'}`} />
            )}
            
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Klik untuk upload</span> atau drag & drop
            </p>
            <p className="text-xs text-gray-400">
              SHP (ZIP), GeoJSON, KML, GPX (Max: 50MB)
            </p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept=".zip,.geojson,.json,.kml,.gpx"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
        </label>
      </div>
    </div>
  );
}
