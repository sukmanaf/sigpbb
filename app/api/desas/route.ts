import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getSession } from '@/lib/auth';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123123',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'maps',
});

export async function GET() {
  try {
    const user = await getSession();
    
    let whereClause = "";
    const params = [];
    
    if (user) {
        if (user.role === 'desa' && user.kodeWilayah) {
            whereClause = "WHERE d_kd_kel = $1";
            params.push(user.kodeWilayah);
        } else if (user.role === 'kecamatan' && user.kodeWilayah) {
            whereClause = "WHERE d_kd_kel LIKE $1";
            // Get first 7 characters for kecamatan
            let kecCode = user.kodeWilayah;
            if (kecCode.includes('.')) {
                kecCode = kecCode.split('.').slice(0,3).join('');
            } else if (kecCode.length >= 7) {
                kecCode = kecCode.substring(0, 7);
            }
            params.push(`${kecCode}%`);
        }
    }

    const query = `
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(json_agg(ST_AsGeoJSON(t.*)::json), '[]'::json)
      ) as geojson
      FROM (
        SELECT id, d_kd_kel, d_nm_kel, geom 
        FROM desas
        ${whereClause}
      ) as t;
    `;
    const { rows } = await pool.query(query, params);
    
    // Fallback if empty
    const geojson = rows[0]?.geojson || { type: 'FeatureCollection', features: [] };
    
    return NextResponse.json(geojson, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching desas geojson:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
