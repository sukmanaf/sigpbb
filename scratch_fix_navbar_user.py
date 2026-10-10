import re

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'r') as f:
    content = f.read()

content = content.replace("{user.username}", "{currentUser?.name || 'Loading...'}")
content = content.replace("{user.role}", "{currentUser?.role || ''}")

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'w') as f:
    f.write(content)
