import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side proxy for Copernicus Data Space Ecosystem (CDSE) Sentinel-2 NDVI.
 *
 * Uses OAuth2 client credentials to authenticate, then:
 *  - Statistical API → mean/min/max NDVI for a bounding box
 *  - Process API   → WMS-like PNG image URL (returned as base64)
 *
 * Required env vars:
 *   SENTINEL_CLIENT_ID      — CDSE OAuth2 client ID
 *   SENTINEL_CLIENT_SECRET  — CDSE OAuth2 client secret
 */

const TOKEN_URL = 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token';
const STATS_URL = 'https://sh.dataspace.copernicus.eu/api/v1/statistics';
const PROCESS_URL = 'https://sh.dataspace.copernicus.eu/api/v1/process';

// NDVI evalscript for Sentinel-2 L2A
const NDVI_EVALSCRIPT = `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "dataMask"] }],
    output: [
      { id: "ndvi", bands: 1, sampleType: "FLOAT32" },
      { id: "dataMask", bands: 1 }
    ]
  };
}
function evaluatePixel(sample) {
  const ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  return { ndvi: [ndvi], dataMask: [sample.dataMask] };
}`;

// Visual NDVI evalscript (returns colored PNG with transparency for overlay)
const NDVI_VISUAL_EVALSCRIPT = `//VERSION=3
function setup() {
  return {
    input: ["B04", "B08", "dataMask"],
    output: { bands: 4 }
  };
}
function evaluatePixel(sample) {
  if (sample.dataMask === 0) return [0, 0, 0, 0];
  const ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  if (ndvi < -0.2) return [0.05, 0.05, 0.05, 1];
  if (ndvi < 0.0)  return [0.75, 0.75, 0.75, 1];
  if (ndvi < 0.1)  return [0.86, 0.86, 0.86, 1];
  if (ndvi < 0.2)  return [0.92, 0.84, 0.69, 1];
  if (ndvi < 0.3)  return [0.80, 0.78, 0.51, 1];
  if (ndvi < 0.4)  return [0.60, 0.72, 0.32, 1];
  if (ndvi < 0.5)  return [0.44, 0.64, 0.22, 1];
  if (ndvi < 0.6)  return [0.30, 0.55, 0.16, 1];
  if (ndvi < 0.7)  return [0.20, 0.47, 0.13, 1];
  if (ndvi < 0.8)  return [0.12, 0.39, 0.10, 1];
  return [0.0, 0.27, 0.07, 1];
}`;

// True-color evalscript (natural satellite photo: B04=Red, B03=Green, B02=Blue)
const TRUE_COLOR_EVALSCRIPT = `//VERSION=3
function setup() {
  return {
    input: ["B04", "B03", "B02", "dataMask"],
    output: { bands: 4 }
  };
}
function evaluatePixel(sample) {
  if (sample.dataMask === 0) return [0, 0, 0, 0];
  const gain = 2.5;
  return [
    Math.min(1, sample.B04 * gain),
    Math.min(1, sample.B03 * gain),
    Math.min(1, sample.B02 * gain),
    1
  ];
}`;
let cachedToken: { access_token: string; expires_at: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.SENTINEL_CLIENT_ID;
  const clientSecret = process.env.SENTINEL_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  // Return cached token if still valid (with 60s margin)
  if (cachedToken && cachedToken.expires_at > Date.now() + 60_000) {
    return cachedToken.access_token;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    console.error('CDSE OAuth error:', res.status, await res.text());
    return null;
  }

  const data = await res.json();
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in || 300) * 1000,
  };
  return cachedToken.access_token;
}

export async function GET(req: NextRequest) {
  const lat = parseFloat(req.nextUrl.searchParams.get('lat') || '');
  const lon = parseFloat(req.nextUrl.searchParams.get('lon') || '');
  // Optional tight bounding box from catastro parcel (minLon,minLat,maxLon,maxLat)
  const bboxParam = req.nextUrl.searchParams.get('bbox');

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: 'lat y lon requeridos' }, { status: 400 });
  }

  // Date range: last 30 days
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 30);
  const fromStr = fromDate.toISOString().split('T')[0] + 'T00:00:00Z';
  const toStr = toDate.toISOString().split('T')[0] + 'T23:59:59Z';

  // Use parcel tight bbox if provided, otherwise ~500m around center
  let bbox: number[];
  if (bboxParam) {
    bbox = bboxParam.split(',').map(Number);
    if (bbox.length !== 4 || bbox.some(isNaN)) {
      const d = 0.005;
      bbox = [lon - d, lat - d, lon + d, lat + d];
    }
  } else {
    const d = 0.005;
    bbox = [lon - d, lat - d, lon + d, lat + d];
  }

  const token = await getAccessToken();

  if (!token) {
    // No credentials configured — return mock estimation with guidance
    return NextResponse.json({
      configured: false,
      message: 'Sentinel-2 no configurado. Añade SENTINEL_CLIENT_ID y SENTINEL_CLIENT_SECRET en .env.local (Copernicus Data Space).',
      ndvi_mean: null,
      ndvi_image: null,
    });
  }

  try {
    // 1) Statistical API — get NDVI mean/min/max
    const statsBody = {
      input: {
        bounds: { bbox, properties: { crs: 'http://www.opengis.net/def/crs/EPSG/0/4326' } },
        data: [{
          type: 'sentinel-2-l2a',
          dataFilter: {
            timeRange: { from: fromStr, to: toStr },
            maxCloudCoverage: 30,
          },
        }],
      },
      aggregation: {
        timeRange: { from: fromStr, to: toStr },
        aggregationInterval: { of: 'P30D' },
        evalscript: NDVI_EVALSCRIPT,
        resx: 10,
        resy: 10,
      },
      calculations: { default: {} },
    };

    const statsRes = await fetch(STATS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(statsBody),
      signal: AbortSignal.timeout(20000),
    });

    let ndviStats: { mean: number; min: number; max: number; stdev: number; date: string } | null = null;

    if (statsRes.ok) {
      const statsData = await statsRes.json();
      // Parse statistical response
      const intervals = statsData?.data?.[0]?.outputs?.ndvi?.bands?.B0?.stats;
      if (intervals) {
        ndviStats = {
          mean: intervals.mean ?? 0,
          min: intervals.min ?? 0,
          max: intervals.max ?? 0,
          stdev: intervals.stDev ?? 0,
          date: toStr,
        };
      }
      // Try alternative response structure
      if (!ndviStats && statsData?.data?.[0]?.outputs) {
        const outputs = statsData.data[0].outputs;
        const firstOutput = Object.values(outputs)[0] as any;
        if (firstOutput?.bands) {
          const firstBand = Object.values(firstOutput.bands)[0] as any;
          if (firstBand?.stats) {
            ndviStats = {
              mean: firstBand.stats.mean ?? 0,
              min: firstBand.stats.min ?? 0,
              max: firstBand.stats.max ?? 0,
              stdev: firstBand.stats.stDev ?? 0,
              date: toStr,
            };
          }
        }
      }
    } else {
      console.error('CDSE Stats error:', statsRes.status, await statsRes.text().catch(() => ''));
    }

    // 2) Process API — get NDVI visual PNG (high resolution)
    const makeProcessBody = (evalscript: string) => ({
      input: {
        bounds: { bbox, properties: { crs: 'http://www.opengis.net/def/crs/EPSG/0/4326' } },
        data: [{
          type: 'sentinel-2-l2a',
          dataFilter: {
            timeRange: { from: fromStr, to: toStr },
            maxCloudCoverage: 30,
            mosaickingOrder: 'leastCC',
          },
        }],
      },
      output: {
        width: 1024,
        height: 1024,
        responses: [{ identifier: 'default', format: { type: 'image/png' } }],
      },
      evalscript,
    });

    const fetchImage = async (evalscript: string): Promise<string | null> => {
      try {
        const res = await fetch(PROCESS_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'image/png',
          },
          body: JSON.stringify(makeProcessBody(evalscript)),
          signal: AbortSignal.timeout(30000),
        });
        if (res.ok) {
          const buf = await res.arrayBuffer();
          return `data:image/png;base64,${Buffer.from(buf).toString('base64')}`;
        }
        console.error('CDSE Process error:', res.status, await res.text().catch(() => ''));
      } catch (e) {
        console.error('CDSE Process fetch error:', e);
      }
      return null;
    };

    // Fetch both images in parallel
    const [ndviImageBase64, trueColorBase64] = await Promise.all([
      fetchImage(NDVI_VISUAL_EVALSCRIPT),
      fetchImage(TRUE_COLOR_EVALSCRIPT),
    ]);

    return NextResponse.json({
      configured: true,
      ndvi_mean: ndviStats?.mean ?? null,
      ndvi_min: ndviStats?.min ?? null,
      ndvi_max: ndviStats?.max ?? null,
      ndvi_stdev: ndviStats?.stdev ?? null,
      ndvi_date: ndviStats?.date ?? null,
      ndvi_image: ndviImageBase64,
      truecolor_image: trueColorBase64,
      bbox,
      source: 'Sentinel-2 L2A (Copernicus Data Space)',
    });
  } catch (e: any) {
    console.error('Sentinel proxy error:', e);
    return NextResponse.json({
      configured: true,
      error: e.message || 'Error al consultar Sentinel-2',
      ndvi_mean: null,
      ndvi_image: null,
    }, { status: 502 });
  }
}
