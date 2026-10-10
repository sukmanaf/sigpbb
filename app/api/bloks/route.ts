import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const desa = searchParams.get('desa');

    if (!desa) {
      return NextResponse.json({ success: false, error: 'Desa parameter is required' }, { status: 400 });
    }

    const sql = `
      SELECT DISTINCT SUBSTRING(d_blok, 11, 3) as blok_code 
      FROM bloks 
      WHERE d_blok LIKE $1 
      ORDER BY blok_code ASC
    `;
    
    const result = await pool.query(sql, [`${desa}%`]);
    
    const blocks = result.rows
      .map(row => row.blok_code)
      .filter(code => code && code.trim().length > 0);

    return NextResponse.json({ success: true, data: blocks });
  } catch (error: any) {
    console.error('Error fetching bloks:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
