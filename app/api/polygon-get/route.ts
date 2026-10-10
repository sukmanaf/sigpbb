import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const type = searchParams.get('type');

        if (!id || !type) {
            return NextResponse.json({ error: 'Missing id or type' }, { status: 400 });
        }

        let table = 'nops';
        let codeCol = 'd_nop';
        if (type === 'blok') { table = 'bloks'; codeCol = 'd_blok'; }
        else if (type === 'bangunan') { table = 'bangunans'; codeCol = 'd_nop'; }
        else if (type === 'desa') { table = 'desas'; codeCol = 'd_kd_kel'; }

        const res = await pool.query(
            `SELECT id, ${codeCol} as code, ST_AsGeoJSON(geom) as geometry FROM ${table} WHERE id = $1`,
            [id]
        );

        if (res.rows.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({
            id: res.rows[0].id,
            code: res.rows[0].code,
            geometry: JSON.parse(res.rows[0].geometry)
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
