import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !['admin', 'bapenda'].includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { features } = body; // Array of GeoJSON features

        if (!features || !Array.isArray(features) || features.length === 0) {
            return NextResponse.json({ error: 'No features provided' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            let updatedCount = 0;
            for (const feature of features) {
                const type = feature.properties?.type || 'nop'; // assume nop if undefined
                // Extract real ID if feature.id is a string like "nop_123"
                let rawId = feature.id || feature.properties?.id;
                let id = typeof rawId === 'string' && rawId.includes('_') ? rawId.split('_')[1] : rawId;
                
                let table = 'nops';
                if (type === 'blok') table = 'bloks';
                if (type === 'bangunan') table = 'bangunans';
                if (type === 'desa') table = 'desas';

                if (!id) continue;

                // Update geometry
                await client.query(
                    `UPDATE ${table} SET geom = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) WHERE id = $2`,
                    [JSON.stringify(feature.geometry), id]
                );
                updatedCount++;
            }

            await client.query('COMMIT');
            return NextResponse.json({ success: true, updatedCount });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error('Error bulk updating polygons:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
