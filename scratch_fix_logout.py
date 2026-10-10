import re

with open('/home/wgipro/koding/newmap/my-app/app/api/auth/logout/route.ts', 'r') as f:
    content = f.read()

old_block = """    try {
        await clearAuthCookie();
        return NextResponse.json({ success: true, message: 'Logout berhasil' });
    }"""

new_block = """    try {
        const response = NextResponse.json({ success: true, message: 'Logout berhasil' });
        response.cookies.delete('auth_token');
        return response;
    }"""

content = content.replace(old_block, new_block)

with open('/home/wgipro/koding/newmap/my-app/app/api/auth/logout/route.ts', 'w') as f:
    f.write(content)
