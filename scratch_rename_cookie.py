import re

files = [
    '/home/wgipro/koding/newmap/my-app/lib/auth.ts',
    '/home/wgipro/koding/newmap/my-app/middleware.ts',
    '/home/wgipro/koding/newmap/my-app/app/api/auth/login/route.ts',
    '/home/wgipro/koding/newmap/my-app/app/api/auth/logout/route.ts'
]

for filepath in files:
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            
        content = content.replace("'auth_token'", "'sim_auth_token'")
        
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")
    except Exception as e:
        print(f"Error updating {filepath}: {e}")

