import { NextRequest, NextResponse } from 'next/server';
import { getNopDetail } from '@/lib/queries';
import https from 'https';

export const dynamic = 'force-dynamic';

const SISMIOP_API_URL = process.env.SISMIOP_API_URL || 'https://bapenda.pasuruankota.go.id:5151/sismiop/sig_api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // Await params carefully for Next 15 compatibility
  const resolvedParams = await params;
  const id = resolvedParams.id;

  try {
    // 1. Fetch DB detail (geometry etc)
    const detail = await getNopDetail(id);
    
    // 2. Fetch SISMIOP API
    let pbbData = null;
    try {
        const formattedNop = formatNop(id);
        const apiResponse = await makeHttpsRequest(
            `${SISMIOP_API_URL}/GetsPublicData/InformasiOp`,
            formattedNop
        );
        // Bapenda API returns the actual payload nested in data.data
        if (apiResponse && apiResponse.data && apiResponse.data.data) {
            pbbData = apiResponse.data.data;
        } else if (apiResponse && apiResponse.data) {
            pbbData = apiResponse.data;
        }
    } catch (e) {
        console.error('Failed fetching SISMIOP:', e);
    }

    if (!detail && !pbbData) {
      return NextResponse.json({ error: 'NOP not found' }, { status: 404 });
    }

    return NextResponse.json({
        ...(detail || {}),
        pbb: pbbData
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Make HTTPS request with SSL verification disabled
function makeHttpsRequest(url: string, nop: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
        const body = `--${boundary}\r\nContent-Disposition: form-data; name="NOP"\r\n\r\n${nop}\r\n--${boundary}--\r\n`;

        const options: https.RequestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname,
            method: 'POST',
            rejectUnauthorized: false,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': Buffer.byteLength(body),
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Invalid JSON response'));
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

function formatNop(nop: string): string {
    const cleanNop = nop.replace(/[.\-]/g, '');
    if (cleanNop.length !== 18) return nop;
    return [
        cleanNop.substring(0, 2), cleanNop.substring(2, 4), cleanNop.substring(4, 7),
        cleanNop.substring(7, 10), cleanNop.substring(10, 13), cleanNop.substring(13, 17),
        cleanNop.substring(17, 18)
    ].join('.');
}

