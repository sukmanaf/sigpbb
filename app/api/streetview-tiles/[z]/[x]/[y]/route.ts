import { NextRequest, NextResponse } from 'next/server';

// 1x1 transparent PNG buffer to return when no tile or tile is empty
const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ z: string; x: string; y: string }> }
) {
  const { z, x, y } = await params;
  const zNum = parseInt(z, 10);
  const xNum = parseInt(x, 10);
  const yNum = parseInt(y, 10);

  if (isNaN(zNum) || isNaN(xNum) || isNaN(yNum)) {
    return new NextResponse('Invalid tile coordinates', { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Candidates for Google Street View coverage tiles
  const candidateUrls = [
    // 1. Google Maps JS API v3 official vector overlay tile endpoint
    `https://mts1.googleapis.com/vt?hl=en-US&lyrs=svv|cb_client:apiv3&style=40,18&x=${xNum}&y=${yNum}&z=${zNum}${apiKey ? `&key=${apiKey}` : ''}`,
    `https://mts0.googleapis.com/vt?hl=en-US&lyrs=svv|cb_client:apiv3&style=40,18&x=${xNum}&y=${yNum}&z=${zNum}`,
    // 2. Google classic mapslt coverage endpoint (QGIS / Leaflet standard)
    `https://mts1.google.com/mapslt?lyrs=svv&x=${xNum}&y=${yNum}&z=${zNum}&w=256&h=256&hl=en&style=40,18`,
    `https://mts0.google.com/mapslt?lyrs=svv&x=${xNum}&y=${yNum}&z=${zNum}&w=256&h=256&hl=en&style=40,18`,
    `https://mt1.google.com/mapslt?lyrs=svv&x=${xNum}&y=${yNum}&z=${zNum}&w=256&h=256&hl=en`,
  ];

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Referer: 'https://maps.googleapis.com/',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        // Verify it returned an image
        if (contentType.includes('image') || contentType.includes('application/octet-stream')) {
          const buffer = await res.arrayBuffer();
          if (buffer.byteLength > 64) {
            return new NextResponse(new Uint8Array(buffer), {
              status: 200,
              headers: {
                'Content-Type': contentType.includes('image') ? contentType : 'image/png',
                'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
                'Access-Control-Allow-Origin': '*',
              },
            });
          }
        }
      }
    } catch {
      // Try next candidate
    }
  }

  // Gracefully return 1x1 transparent PNG if no tile or Street View coverage not available for this tile
  return new NextResponse(new Uint8Array(TRANSPARENT_PNG), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

