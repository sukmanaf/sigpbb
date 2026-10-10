import re

with open('/home/wgipro/koding/newmap/my-app/lib/auth.ts', 'r') as f:
    content = f.read()

# Replace the cookieStore.set block
old_cookie = """    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' && process.env.HTTPS === 'true',
        sameSite: 'lax',
        maxAge: SESSION_DURATION,
        path: '/',
    });"""

new_cookie = """    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: false, // Force false for local network compatibility
        maxAge: SESSION_DURATION,
        path: '/',
    });"""

content = content.replace(old_cookie, new_cookie)

with open('/home/wgipro/koding/newmap/my-app/lib/auth.ts', 'w') as f:
    f.write(content)
