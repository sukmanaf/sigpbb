import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import https from 'https';

const SISMIOP_API_URL = process.env.SISMIOP_API_URL || 'https://bapenda.pasuruankota.go.id:5151/sismiop/sig_api';

function searchSismiopOp(type: string, value: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(`${SISMIOP_API_URL}/GetsPublicData/pencarianOp`);
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const body = `--${boundary}\r\nContent-Disposition: form-data; name="${type}"\r\n\r\n${value}\r\n--${boundary}--\r\n`;

    const options: https.RequestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: 'POST',
      rejectUnauthorized: false,
      timeout: 8000, // 8 detik timeout agar tidak pending selamanya
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
        } catch {
          reject(new Error('Respon dari server SISMIOP Bapenda tidak valid'));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('Koneksi ke server SISMIOP Bapenda memakan waktu terlalu lama (Timeout 8 detik)'));
    });

    req.on('error', (e) => reject(e));
    req.write(body);
    req.end();
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  const rawType = searchParams.get('type') || 'NOP';
  const type = rawType.toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json({ error: 'Kata kunci pencarian terlalu pendek' }, { status: 400 });
  }

  // 1. Search by Nama or Alamat -> Query SISMIOP pencarianOp
  if (type === 'nama' || type === 'alamat') {
    try {
      const sismiopRes = await searchSismiopOp(type, q.toUpperCase());
      if (sismiopRes && sismiopRes.status && Array.isArray(sismiopRes.data) && sismiopRes.data.length > 0) {
        return NextResponse.json({
          success: true,
          type: 'list',
          data: sismiopRes.data,
        });
      } else {
        return NextResponse.json({ 
          error: `Data tidak ditemukan untuk ${type === 'nama' ? 'nama' : 'alamat'} "${q}"` 
        }, { status: 404 });
      }
    } catch (err: any) {
      console.error('SISMIOP search error:', err);
      const isTimeout = err?.message?.includes('Timeout') || err?.code === 'ETIMEDOUT' || err?.code === 'ECONNRESET';
      return NextResponse.json({ 
        error: isTimeout
          ? 'Koneksi ke server SISMIOP Bapenda timeout. Server Bapenda sedang lambat atau tidak dapat diakses.'
          : (err?.message || 'Gagal mencari data di SISMIOP'), 
        details: err?.message 
      }, { status: 504 });
    }
  }

  // 2. Search by NOP -> Query directly from PostgreSQL local database
  try {
    const client = await pool.connect();
    try {
      const cleanQuery = q.replace(/[^0-9]/g, '');

      const result = await client.query(`
        SELECT 
          n.id, 
          n.d_nop, 
          n.d_luas, 
          ST_AsGeoJSON(n.geom)::json as geom,
          d.d_kd_kel,
          d.d_nm_kel
        FROM nops n
        LEFT JOIN desas d ON d.d_kd_kel = left(n.d_nop, 10)
        WHERE 
          n.d_nop = $1 
          OR replace(replace(replace(n.d_nop, '.', ''), '-', ''), ' ', '') = $1
          OR n.d_nop = $2
          OR n.d_nop ILIKE $3
        ORDER BY 
          CASE 
            WHEN n.d_nop = $1 THEN 1
            WHEN replace(replace(replace(n.d_nop, '.', ''), '-', ''), ' ', '') = $1 THEN 2
            WHEN n.d_nop = $2 THEN 3
            WHEN n.d_nop ILIKE $1 THEN 4
            ELSE 5
          END
        LIMIT 1
      `, [cleanQuery || q, q, `%${cleanQuery || q}%`]);

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'NOP tidak ditemukan di database' }, { status: 404 });
      }

      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ 
      error: 'Terjadi kesalahan saat mencari NOP', 
      details: error?.message 
    }, { status: 500 });
  }
}
