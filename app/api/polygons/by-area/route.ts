import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { geometry, desaKode, layers } = body;

        if (!geometry) {
            return NextResponse.json({ error: 'Missing geometry' }, { status: 400 });
        }

        const geoJson = JSON.stringify(geometry);
        const activeTypes = [];
        
        // Determine which tables to query based on active layers (default to nop if undefined)
        if (!layers || layers.nops !== false) activeTypes.push({ table: 'nops', codeCol: 'd_nop', typeStr: 'nop' });
        if (layers?.bloks) activeTypes.push({ table: 'bloks', codeCol: 'd_blok', typeStr: 'blok' });
        if (layers?.bangunans) activeTypes.push({ table: 'bangunans', codeCol: 'd_nop', typeStr: 'bangunan' });
        if (layers?.desas) activeTypes.push({ table: 'desas', codeCol: 'd_kd_kel', typeStr: 'desa' });

        if (activeTypes.length === 0) {
            return NextResponse.json({ features: [] });
        }

        const queries = activeTypes.map(t => {
            if (desaKode) {
                return `SELECT id, ${t.codeCol} as code, '${t.typeStr}' as type, ST_AsGeoJSON(geom) as geometry 
                        FROM ${t.table} 
                        WHERE LEFT(${t.codeCol}, 10) = $1 
                          AND ST_Intersects(geom, ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON($2), 4326)))`;
            } else {
                return `SELECT id, ${t.codeCol} as code, '${t.typeStr}' as type, ST_AsGeoJSON(geom) as geometry 
                        FROM ${t.table} 
                        WHERE ST_Intersects(geom, ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)))`;
            }
        });

        const finalQuery = queries.join(' UNION ALL ');
        const params = desaKode ? [desaKode, geoJson] : [geoJson];

        console.log(`Bulk select [${activeTypes.map(t=>t.typeStr).join(',')}] - desaKode:`, desaKode);
        const res = await pool.query(finalQuery, params);
        console.log('Bulk select - found rows:', res.rowCount);

        const features = res.rows.map(row => ({
            type: 'Feature' as const,
            id: `${row.type}_${row.id}`, // ensure unique ID across tables for MapboxDraw
            properties: { id: row.id, code: row.code, type: row.type },
            geometry: JSON.parse(row.geometry)
        }));

        return NextResponse.json({ features });
    } catch (error: any) {
        console.error('Error fetching polygons by area:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
