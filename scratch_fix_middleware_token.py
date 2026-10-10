import re

with open('/home/wgipro/koding/newmap/my-app/middleware.ts', 'r') as f:
    content = f.read()

# Replace the redirect block
old_block = """            // If token came from query param, set cookie and redirect to clean URL
            const urlToken = request.nextUrl.searchParams.get('_token');
            if (urlToken && !isApiRoute) {
                const cleanUrl = new URL(pathname, request.url);
                const response = NextResponse.redirect(cleanUrl);
                response.cookies.set('sim_auth_token', token, {
                    httpOnly: true,
                    secure: false,
                    maxAge: 60 * 60 * 24,
                    path: '/',
                });
                return response;
            }"""

new_block = """            // If token came from query param, we also try to set the cookie,
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
            }"""

content = content.replace(old_block, new_block)

with open('/home/wgipro/koding/newmap/my-app/middleware.ts', 'w') as f:
    f.write(content)
