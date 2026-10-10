import re

with open('/home/wgipro/koding/newmap/my-app/components/ui/NopInfoModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("data.INFORMASI_RINCI_OBJEK_PAJAK?.map((o)", "data.INFORMASI_RINCI_OBJEK_PAJAK?.map((o: any)")
content = content.replace("data.INFORMASI_BANGUNAN?.map((b)", "data.INFORMASI_BANGUNAN?.map((b: any)")

with open('/home/wgipro/koding/newmap/my-app/components/ui/NopInfoModal.tsx', 'w') as f:
    f.write(content)
