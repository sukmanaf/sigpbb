import re

with open('/home/wgipro/koding/newmap/my-app/components/ui/NopInfoModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("value={selectedYear}", "value={selectedYear || ''}")
content = content.replace("value={selectedBangunan}", "value={selectedBangunan || ''}")

with open('/home/wgipro/koding/newmap/my-app/components/ui/NopInfoModal.tsx', 'w') as f:
    f.write(content)
