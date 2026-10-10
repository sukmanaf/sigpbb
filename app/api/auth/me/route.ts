import { NextRequest, NextResponse } from 'next/server';
import { getSession, verifyToken } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // 1. Try cookie-based session first
        let user = await getSession();

        // 2. Fallback: check Authorization header (for IP access)
        if (!user) {
            const authHeader = request.headers.get('Authorization');
            if (authHeader?.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                const payload = await verifyToken(token);
                if (payload) {
                    const { rows } = await pool.query(
                        'SELECT id, username, name, role, kode_wilayah FROM users WHERE id = $1 LIMIT 1',
                        [payload.userId]
                    );
                    const dbUser = rows[0];
                    if (dbUser) {
                        user = {
                            id: dbUser.id,
                            username: dbUser.username,
                            name: dbUser.name,
                            role: dbUser.role,
                            kodeWilayah: dbUser.kode_wilayah,
                        };
                    }
                }
            }
        }

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Tidak ada sesi aktif' },
                { status: 401 }
            );
        }
        return NextResponse.json({ success: true, user });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Gagal memeriksa sesi' },
            { status: 500 }
        );
    }
}
