import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { generateNop, calculateArea } from '@/lib/queries';

export async function POST(request: NextRequest) {
  const feature = await request.json();
  const { geometry, properties } = feature;

  const client = await pool.connect();
  try {
    // Validasi geometry
    const validation = await client.query(`
      SELECT ST_IsValid(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)) as valid,
             ST_IsValidReason(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)) as reason
    `, [JSON.stringify(geometry)]);

    if (!validation.rows[0].valid) {
      return NextResponse.json(
        { error: 'Invalid geometry', reason: validation.rows[0].reason },
        { status: 400 }
      );
    }

    const newNop = await generateNop(properties.d_kd_kel);
    const area = await calculateArea(geometry);

    const result = await client.query(`
      INSERT INTO nops (d_nop, d_luas, geom)
      VALUES ($1, $2, ST_SetSRID(ST_GeomFromGeoJSON($3), 4326))
      RETURNING id, d_nop, d_luas
    `, [newNop, area, JSON.stringify(geometry)]);

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      d_nop: result.rows[0].d_nop,
    });
  } finally {
    client.release();
  }
}
