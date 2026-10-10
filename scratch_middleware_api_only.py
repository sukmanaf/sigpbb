import re

with open('/home/wgipro/koding/newmap/my-app/middleware.ts', 'r') as f:
    content = f.read()

# Replace the protected routes block
old_block = """    // Protected routes
    const isProtectedRoute = 
        pathname.startsWith('/map') || 
        pathname.startsWith('/admin') ||
        pathname.startsWith('/settings') ||
                pathname.startsWith('/users') ||
        pathname.startsWith('/usulan') ||
        pathname.startsWith('/api/users') ||
        pathname.startsWith('/api/usulan');"""

new_block = """    // Protected routes (ONLY API ROUTES NOW to allow SPA client-side auth fallback)
    const isProtectedRoute = 
        pathname.startsWith('/api/users') ||
        pathname.startsWith('/api/usulan');"""

content = content.replace(old_block, new_block)

# Replace the redirect block
old_block_2 = """    if (pathname === '/') {
        const token = getTokenFromRequest(request);
        if (token) {
            try {
                await jwtVerify(token, JWT_SECRET);
                return NextResponse.redirect(new URL('/map', request.url));
            } catch (e) {
                // Ignore error, just don't redirect
            }
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isPublicRoute && pathname !== '/api/auth/logout') {
        const token = getTokenFromRequest(request);
        if (token) {
            try {
                await jwtVerify(token, JWT_SECRET);
                return NextResponse.redirect(new URL('/map', request.url));
            } catch (e) {
                // Ignore
            }
        }
    }"""

new_block_2 = """    if (pathname === '/') {
        return NextResponse.redirect(new URL('/map', request.url));
    }"""

content = content.replace(old_block_2, new_block_2)

with open('/home/wgipro/koding/newmap/my-app/middleware.ts', 'w') as f:
    f.write(content)
