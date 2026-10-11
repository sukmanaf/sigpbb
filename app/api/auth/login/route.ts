import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: 'Username dan password harus diisi' },
                { status: 400 }
            );
        }

        const { rows } = await pool.query(
            'SELECT * FROM users WHERE username = $1 LIMIT 1',
            [username]
        );
        const user = rows[0];

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Username atau password salah' },
                { status: 401 }
            );
        }

        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
            return NextResponse.json(
                { success: false, message: 'Username atau password salah' },
                { status: 401 }
            );
        }

        const token = await createToken(user);

        const response = NextResponse.json({
            success: true,
            message: 'Login berhasil',
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                kodeWilayah: user.kode_wilayah,
            },
        });

        response.cookies.set('sim_auth_token', token, {
            httpOnly: true,
            secure: false,
            maxAge: 60 * 60 * 24,
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Terjadi kesalahan saat login',
                error_detail: error?.message || String(error),
                error_stack: error?.stack 
            },
            { status: 500 }
        );
    }
}
