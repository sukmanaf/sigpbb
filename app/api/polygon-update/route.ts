import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const type = formData.get('type') as string;
        const id = formData.get('id') as string;
        const code = formData.get('code') as string;
        const coordinatesJson = formData.get('coordinates') as string;
        const coordinates = JSON.parse(coordinatesJson);

        if (!type || !id || !code || !coordinates) {
            return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
        }

        // coordinates from MapboxDraw editing is an array of rings for a Polygon.
        // OR it might be a MultiPolygon. We handle a single Polygon here:
        let wktPoints;
        // If it's [[[lng, lat], ...]] (Polygon)
        if (Array.isArray(coordinates[0]) && Array.isArray(coordinates[0][0]) && typeof coordinates[0][0][0] === 'number') {
            wktPoints = coordinates[0].map((c: number[]) => `${c[0]} ${c[1]}`).join(', ');
        } else if (Array.isArray(coordinates[0]) && typeof coordinates[0][0] === 'number') {
            wktPoints = coordinates.map((c: number[]) => `${c[0]} ${c[1]}`).join(', ');
        } else {
            // Very deeply nested (MultiPolygon), we just grab the first polygon
            wktPoints = coordinates[0][0].map((c: number[]) => `${c[0]} ${c[1]}`).join(', ');
        }
        
        const wkt = `POLYGON((${wktPoints}))`;

        if (type === 'nop') {
            const newFiles = formData.getAll('newFiles') as File[];
            if (newFiles && newFiles.length > 0) {
                const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'nop', code);
                await mkdir(uploadDir, { recursive: true });
                for (const file of newFiles) {
                    if (file.size > 0) {
                        const buffer = Buffer.from(await file.arrayBuffer());
                        const filename = `${Date.now()}_${file.name}`;
                        await writeFile(path.join(uploadDir, filename), buffer);
                    }
                }
            }

            await pool.query(
                `UPDATE nops SET d_nop = $1, geom = ST_GeomFromText($2, 4326), updated_at = NOW() WHERE id = $3`,
                [code, wkt, id]
            );
        } else if (type === 'blok') {
            await pool.query(
                `UPDATE bloks SET d_blok = $1, geom = ST_GeomFromText($2, 4326), updated_at = NOW() WHERE id = $3`,
                [code, wkt, id]
            );
        } else if (type === 'bangunan') {
            await pool.query(
                `UPDATE bangunans SET d_nop = $1, geom = ST_GeomFromText($2, 4326), updated_at = NOW() WHERE id = $3`,
                [code, wkt, id]
            );
        } else if (type === 'desa') {
            await pool.query(
                `UPDATE desas SET d_kd_kel = $1, geom = ST_GeomFromText($2, 4326), updated_at = NOW() WHERE id = $3`,
                [code, wkt, id]
            );
        }

        return NextResponse.json({ success: true, message: 'Updated successfully' });

    } catch (error: any) {
        console.error('Update error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
