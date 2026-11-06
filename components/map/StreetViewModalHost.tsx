'use client';

import React, { useContext } from 'react';
import { MapContext } from '@/components/providers/MapProvider';
import { StreetViewModal } from '@/components/map/StreetViewModal';

export function StreetViewModalHost() {
  const ctx = useContext(MapContext);

  if (!ctx?.activeStreetViewCoords) return null;

  return (
    <StreetViewModal
      coords={ctx.activeStreetViewCoords}
      onClose={() => ctx.setActiveStreetViewCoords(null)}
    />
  );
}

