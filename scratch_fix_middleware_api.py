import re

with open('/home/wgipro/koding/newmap/my-app/middleware.ts', 'r') as f:
    content = f.read()

replacement = """    if (isProtectedRoute) {
        const token = request.cookies.get('auth_token')?.value;
        const isApiRoute = pathname.startsWith('/api/');

        if (!token) {
            if (isApiRoute) {
                return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            // Verify token
            await jwtVerify(token, JWT_SECRET);
            return NextResponse.next();
        } catch (error) {
            // Token invalid or expired
            if (isApiRoute) {
                return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }"""

content = re.sub(
    r"    if \(isProtectedRoute\) \{\n        const token = request\.cookies\.get\('auth_token'\)\?\.value;\n\n        if \(!token\) \{\n            return NextResponse\.redirect\(new URL\('/login', request\.url\)\);\n        \}\n\n        try \{\n            // Verify token\n            await jwtVerify\(token, JWT_SECRET\);\n            return NextResponse\.next\(\);\n        \} catch \(error\) \{\n            // Token invalid or expired\n            return NextResponse\.redirect\(new URL\('/login', request\.url\)\);\n        \}\n    \}",
    replacement,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/middleware.ts', 'w') as f:
    f.write(content)
