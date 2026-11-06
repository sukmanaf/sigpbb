// Global script loader cache to prevent multiple script tag insertions
let googleMapsScriptPromise: Promise<any> | null = null;

export function loadGoogleMapsScript(apiKey?: string): Promise<any> {
  const key = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDNC33SroGZ6S4dklZsuwA6B7Ze9zmZous';
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));

  if ((window as any).google?.maps) {
    return Promise.resolve((window as any).google.maps);
  }

  if (googleMapsScriptPromise) {
    return googleMapsScriptPromise;
  }

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('google-maps-js-sdk');
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).google.maps));
      existing.addEventListener('error', (err) => reject(err));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-js-sdk';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if ((window as any).google?.maps) {
        resolve((window as any).google.maps);
      } else {
        reject(new Error('Google Maps object not found after script load'));
      }
    };
    script.onerror = (err) => {
      googleMapsScriptPromise = null;
      reject(err);
    };
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}

export interface StreetViewCoverageResult {
  available: boolean;
  pano?: string;
  latLng?: { lat: number; lng: number };
  heading?: number;
  distance?: number;
}

// In-memory cache for coverage checks to avoid re-querying the same coordinates repeatedly
const coverageCache = new Map<string, StreetViewCoverageResult>();

export async function checkStreetViewCoverage(
  lat: number,
  lng: number,
  maxRadius = 85
): Promise<StreetViewCoverageResult> {
  const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (coverageCache.has(cacheKey)) {
    return coverageCache.get(cacheKey)!;
  }

  try {
    const maps = await loadGoogleMapsScript();
    const sv = new maps.StreetViewService();
    const target = new maps.LatLng(lat, lng);

    // Tiered progressive search:
    // 1. Tier 1 (30m): Direct street right in front of parcel (mencegah loncat ke jalan lain)
    // 2. Tier 2 (55m): Access road / mouth of gang
    // 3. Tier 3 (85m): Maximum neighborhood radius
    // Always use StreetViewPreference.NEAREST so Google does NOT favor larger roads farther away!
    const tiers = [
      { radius: 30, outdoor: true },
      { radius: 55, outdoor: true },
      { radius: Math.min(maxRadius, 85), outdoor: true },
      { radius: 45, outdoor: false }, // Fallback if pano isn't tagged OUTDOOR
      { radius: Math.min(maxRadius, 85), outdoor: false },
    ];

    const queryTier = (tier: { radius: number; outdoor: boolean }): Promise<any> => {
      return new Promise((resolve) => {
        const req: any = {
          location: target,
          radius: tier.radius,
          preference: maps.StreetViewPreference ? maps.StreetViewPreference.NEAREST : 'nearest',
        };
        if (tier.outdoor && maps.StreetViewSource?.OUTDOOR) {
          req.source = maps.StreetViewSource.OUTDOOR;
        }
        sv.getPanorama(req, (data: any, status: any) => {
          if (status === maps.StreetViewStatus.OK && data?.location?.pano && data?.location?.latLng) {
            resolve(data);
          } else {
            resolve(null);
          }
        });
      });
    };

    let matched: any = null;
    for (const tier of tiers) {
      matched = await queryTier(tier);
      if (matched) break;
    }

    if (matched?.location?.latLng) {
      const panoLoc = matched.location.latLng;
      const panoLat = panoLoc.lat();
      const panoLng = panoLoc.lng();

      // Compute heading facing from camera towards parcel
      let heading = 0;
      if (maps.geometry?.spherical?.computeHeading) {
        heading = Math.round(maps.geometry.spherical.computeHeading(panoLoc, target));
        heading = ((heading % 360) + 360) % 360;
      }

      // Compute distance in meters
      let distance = 0;
      if (maps.geometry?.spherical?.computeDistanceBetween) {
        distance = Math.round(maps.geometry.spherical.computeDistanceBetween(panoLoc, target));
      }

      const result: StreetViewCoverageResult = {
        available: true,
        pano: matched.location.pano,
        latLng: {
          lat: panoLat,
          lng: panoLng,
        },
        heading,
        distance,
      };
      coverageCache.set(cacheKey, result);
      return result;
    }

    const result: StreetViewCoverageResult = { available: false };
    coverageCache.set(cacheKey, result);
    return result;
  } catch {
    return { available: false };
  }
}

/**
 * Helper to open Google Street View in a focused, centered floating popup window
 * instead of opening a full new browser tab, keeping the user in the GIS context.
 */
export function openStreetView(lat: number, lng: number) {
  if (typeof window === 'undefined') return;

  const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
  const width = Math.min(1000, window.innerWidth - 40);
  const height = Math.min(680, window.innerHeight - 40);
  const left = Math.max(0, Math.round((window.innerWidth - width) / 2 + (window.screenX || 0)));
  const top = Math.max(0, Math.round((window.innerHeight - height) / 2 + (window.screenY || 0)));

  const windowFeatures = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'resizable=yes',
    'scrollbars=yes',
    'status=no',
    'toolbar=no',
    'menubar=no',
  ].join(',');

  const popup = window.open(url, 'GoogleStreetViewWindow', windowFeatures);
  if (popup) {
    popup.focus();
  }
}


