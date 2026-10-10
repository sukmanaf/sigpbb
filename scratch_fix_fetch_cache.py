import re

with open('/home/wgipro/koding/newmap/my-app/app/login/page.tsx', 'r') as f:
    content = f.read()
content = content.replace("fetch('/api/settings')", "fetch('/api/settings', { cache: 'no-store' })")
with open('/home/wgipro/koding/newmap/my-app/app/login/page.tsx', 'w') as f:
    f.write(content)


with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'r') as f:
    content = f.read()
content = content.replace("fetch('/api/settings')", "fetch('/api/settings', { cache: 'no-store' })")
with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'w') as f:
    f.write(content)

