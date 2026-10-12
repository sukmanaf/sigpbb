import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const desa = searchParams.get('desa');

    if (!desa) {
      return NextResponse.json({ success: false, error: 'Desa parameter is required' }, { status: 400 });
    }

    const cleanDesa = desa.replace(/[^0-9]/g, '');

    const sql = `
      SELECT DISTINCT blok_code 
      FROM (
        SELECT SUBSTRING(REPLACE(d_blok, '.', ''), 11, 3) as blok_code 
        FROM bloks 
        WHERE REPLACE(d_blok, '.', '') LIKE $1
        UNION
        SELECT SUBSTRING(REPLACE(d_nop, '.', ''), 11, 3) as blok_code 
        FROM nops 
        WHERE REPLACE(d_nop, '.', '') LIKE $1
      ) combined
      WHERE blok_code IS NOT NULL AND LENGTH(TRIM(blok_code)) = 3
      ORDER BY blok_code ASC
    `;
    
    const result = await pool.query(sql, [`${cleanDesa}%`]);
    
    const blocks = result.rows
      .map(row => row.blok_code)
      .filter(code => code && code.trim().length > 0);

    return NextResponse.json({ success: true, data: blocks });
  } catch (error: any) {
    console.error('Error fetching bloks:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
