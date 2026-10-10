import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
);

// Helper: extract token from cookie, Authorization header, or query parameter
function getTokenFromRequest(request: NextRequest): string | null {
    // 1. Try cookie first
    const cookieToken = request.cookies.get('sim_auth_token')?.value;
    if (cookieToken) return cookieToken;

    // 2. Fallback: Authorization header (for fetch calls from IP address)
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    // 3. Fallback: query parameter (for page navigation from IP address)
    const urlToken = request.nextUrl.searchParams.get('_token');
    if (urlToken) return urlToken;

    return null;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Protected routes (ONLY API ROUTES NOW to allow SPA client-side auth fallback)
    const isProtectedRoute = 
        pathname.startsWith('/api/users') ||
        pathname.startsWith('/api/usulan');
        
    const isPublicRoute = pathname.startsWith('/login');

    if (isProtectedRoute) {
        const token = getTokenFromRequest(request);
        const isApiRoute = pathname.startsWith('/api/');

        if (!token) {
            if (isApiRoute) {
                return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            await jwtVerify(token, JWT_SECRET);
            
            // If token came from query param, we also try to set the cookie,
            // but we DO NOT redirect. This way if the browser drops the cookie,
            // the _token remains in the URL for the lifetime of the page.
            const urlToken = request.nextUrl.searchParams.get('_token');
            if (urlToken && !isApiRoute) {
                const response = NextResponse.next();
                response.cookies.set('sim_auth_token', token, {
                    httpOnly: true,
                    secure: false,
                    maxAge: 60 * 60 * 24,
                    path: '/',
                });
                return response;
            }
            
            return NextResponse.next();
        } catch (error) {
            if (isApiRoute) {
                return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    if (pathname === '/') {
        return NextResponse.redirect(new URL('/map', request.url));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
