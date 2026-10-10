import re

with open('/home/wgipro/koding/newmap/my-app/app/api/auth/login/route.ts', 'r') as f:
    content = f.read()

# Replace the cookie setting block
old_block = """        const token = await createToken(user);
        await setAuthCookie(token);

        return NextResponse.json({
            success: true,
            message: 'Login berhasil',
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                kodeWilayah: user.kode_wilayah,
            },
        });"""

new_block = """        const token = await createToken(user);

        const response = NextResponse.json({
            success: true,
            message: 'Login berhasil',
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                kodeWilayah: user.kode_wilayah,
            },
        });

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: false,
            maxAge: 60 * 60 * 24,
            path: '/',
        });

        return response;"""

content = content.replace(old_block, new_block)

with open('/home/wgipro/koding/newmap/my-app/app/api/auth/login/route.ts', 'w') as f:
    f.write(content)
