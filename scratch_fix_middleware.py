import re

with open('/home/wgipro/koding/newmap/my-app/middleware.ts', 'r') as f:
    content = f.read()

content = content.replace("pathname.startsWith('/admin') ||", "pathname.startsWith('/admin') ||\n        pathname.startsWith('/settings') ||\n        pathname.startsWith('/api/settings') ||")

with open('/home/wgipro/koding/newmap/my-app/middleware.ts', 'w') as f:
    f.write(content)
