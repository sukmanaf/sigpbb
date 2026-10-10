import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { calculateArea } from '@/lib/queries';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const feature = await request.json();
  const { geometry } = feature;

  const client = await pool.connect();
  try {
    const validation = await client.query(`
      SELECT ST_IsValid(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)) as valid
    `, [JSON.stringify(geometry)]);

    if (!validation.rows[0].valid) {
      return NextResponse.json({ error: 'Invalid geometry' }, { status: 400 });
    }

    // Check overlap
    const overlap = await client.query(`
      SELECT id FROM nops
      WHERE id != $1
      AND ST_Intersects(geom, ST_SetSRID(ST_GeomFromGeoJSON($2), 4326))
      AND ST_Area(ST_Intersection(geom, ST_SetSRID(ST_GeomFromGeoJSON($2), 4326))) > 0.0001
    `, [id, JSON.stringify(geometry)]);

    if (overlap.rows.length > 0) {
      return NextResponse.json(
        { error: 'Overlap dengan NOP lain', overlaps: overlap.rows },
        { status: 400 }
      );
    }

    const area = await calculateArea(geometry);

    await client.query(`
      UPDATE nops
      SET geom = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326),
          d_luas = $2
      WHERE id = $3
    `, [JSON.stringify(geometry), area, id]);

    return NextResponse.json({ success: true });
  } finally {
    client.release();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const client = await pool.connect();
  try {
    await client.query('DELETE FROM nops WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } finally {
    client.release();
  }
}
