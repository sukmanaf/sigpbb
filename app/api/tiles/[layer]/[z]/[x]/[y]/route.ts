import { NextRequest, NextResponse } from 'next/server';
import { getMvtTile } from '@/lib/mvt';

const VALID_LAYERS = ['kecamatans', 'desas', 'bloks', 'nops', 'bangunans'];
const DESA_FILTERED_LAYERS = ['nops', 'bloks', 'bangunans'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ layer: string; z: string; x: string; y: string }> }
) {
  const { layer, z, x, y } = await params;

  if (!VALID_LAYERS.includes(layer)) {
    return new NextResponse('Invalid layer', { status: 400 });
  }

  const zNum = parseInt(z);
  const xNum = parseInt(x);
  const yNum = parseInt(y);

  if (isNaN(zNum) || isNaN(xNum) || isNaN(yNum)) {
    return new NextResponse('Invalid tile coordinates', { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const desaCode = searchParams.get('desa') || undefined;

  if (DESA_FILTERED_LAYERS.includes(layer) && !desaCode) {
    return new NextResponse('Parameter "desa" wajib untuk layer ini', { status: 400 });
  }

  // Return empty tile for placeholder (layer not yet activated by user)
  if (desaCode === '__placeholder__') {
    return new NextResponse(new Uint8Array(0), {
      headers: {
        'Content-Type': 'application/vnd.mapbox-vector-tile',
        'Cache-Control': 'no-store',
      },
    });
  }

  try {
    const mvtBuffer = await getMvtTile(layer, zNum, xNum, yNum, desaCode);
    // Convert Buffer to Uint8Array for NextResponse compatibility
    const body = new Uint8Array(mvtBuffer);

    return new NextResponse(body, {
      headers: {
        'Content-Type': 'application/vnd.mapbox-vector-tile',
        'Cache-Control': 'no-store, max-age=0',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('MVT Error:', error);
    return new NextResponse('Tile generation failed', { status: 500 });
  }
}
