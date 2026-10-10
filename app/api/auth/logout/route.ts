import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
    try {
        const response = NextResponse.json({ success: true, message: 'Logout berhasil' });
        response.cookies.delete('sim_auth_token');
        return response;
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Gagal logout' },
            { status: 500 }
        );
    }
}
