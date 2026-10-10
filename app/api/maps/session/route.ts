import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Cache session token server-side (valid 2 weeks)
let cachedSessions: Record<string, { token: string; expiry: number }> = {};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mapType = url.searchParams.get('mapType') || 'roadmap';
  const language = url.searchParams.get('language') || 'id';
  const region = url.searchParams.get('region') || 'ID';
  const overlay = url.searchParams.get('overlay') === 'true';

  const cacheKey = `${mapType}-${language}-${region}-${overlay}`;

  // Return cached token if still valid (with 1-day safety margin)
  if (cachedSessions[cacheKey] && Date.now() < cachedSessions[cacheKey].expiry) {
    return NextResponse.json({ session: cachedSessions[cacheKey].token });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://tile.googleapis.com/v1/createSession?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mapType,
          language,
          region,
          overlay,
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    const data = await res.json();
    
    // Cache for 13 days (token valid 14 days, safety margin 1 day)
    cachedSessions[cacheKey] = {
      token: data.session,
      expiry: Date.now() + 13 * 24 * 60 * 60 * 1000,
    };

    return NextResponse.json({ session: data.session });
  } catch (error: any) {
    console.error('Error creating map session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
