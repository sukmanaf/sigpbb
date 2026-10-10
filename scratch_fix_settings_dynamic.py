import re

with open('/home/wgipro/koding/newmap/my-app/app/api/settings/route.ts', 'r') as f:
    content = f.read()

content = "export const dynamic = 'force-dynamic';\n\n" + content

with open('/home/wgipro/koding/newmap/my-app/app/api/settings/route.ts', 'w') as f:
    f.write(content)
