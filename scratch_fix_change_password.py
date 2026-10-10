import re

with open('/home/wgipro/koding/newmap/my-app/app/api/auth/change-password/route.ts', 'r') as f:
    content = f.read()

content = content.replace("getCurrentUser", "getSession")

with open('/home/wgipro/koding/newmap/my-app/app/api/auth/change-password/route.ts', 'w') as f:
    f.write(content)
