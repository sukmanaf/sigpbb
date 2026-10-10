import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const type = formData.get('type') as string;
        const code = formData.get('code') as string;
        const coordinatesJson = formData.get('coordinates') as string;
        const coordinates = JSON.parse(coordinatesJson);

        if (!type || !code || !coordinates) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create WKT polygon from coordinates
        // MapboxDraw returns a Polygon as an array of rings, and the first ring is the outer ring.
        // The coordinates is the outer ring array, so we format it:
        const wktPoints = coordinates.map((c: number[]) => `${c[0]} ${c[1]}`).join(', ');
        const wkt = `POLYGON((${wktPoints}))`;

        
        let insertedId;

        if (type === 'nop') {
            const files = formData.getAll('files') as File[];

            if (files.length > 0) {
                const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'nop', code);
                await mkdir(uploadDir, { recursive: true });

                for (const file of files) {
                    if (file.size > 0) {
                        const buffer = Buffer.from(await file.arrayBuffer());
                        const filename = `${Date.now()}_${file.name}`;
                        await writeFile(path.join(uploadDir, filename), buffer);
                    }
                }
            }

            const res = await pool.query(
                `INSERT INTO nops (d_nop, d_luas, geom, created_at, updated_at) 
                 VALUES ($1, '0', ST_GeomFromText($2, 4326), NOW(), NOW()) RETURNING id`,
                [code, wkt]
            );
            insertedId = res.rows[0].id;

        } else if (type === 'blok') {
            const res = await pool.query(
                `INSERT INTO bloks (d_blok, geom, created_at, updated_at) 
                 VALUES ($1, ST_GeomFromText($2, 4326), NOW(), NOW()) RETURNING id`,
                [code, wkt]
            );
            insertedId = res.rows[0].id;

        } else if (type === 'bangunan') {
            const res = await pool.query(
                `INSERT INTO bangunans (d_nop, geom, created_at, updated_at) 
                 VALUES ($1, ST_GeomFromText($2, 4326), NOW(), NOW()) RETURNING id`,
                [code, wkt]
            );
            insertedId = res.rows[0].id;

        } else {
            return NextResponse.json(
                { success: false, message: 'Invalid polygon type' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `${type.toUpperCase()} saved successfully`,
            id: insertedId,
        });

    } catch (error: any) {
        console.error('Error saving polygon:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to save polygon' },
            { status: 500 }
        );
    }
}
