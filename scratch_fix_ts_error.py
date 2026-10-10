import re

with open('/home/wgipro/koding/newmap/my-app/components/ui/NopInfoModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("(o) => o.TAHUN_PAJAK ===", "(o: any) => o.TAHUN_PAJAK ===")
content = content.replace("(b) => b.NO_BNG ===", "(b: any) => b.NO_BNG ===")

with open('/home/wgipro/koding/newmap/my-app/components/ui/NopInfoModal.tsx', 'w') as f:
    f.write(content)
