import re

with open('/home/wgipro/koding/newmap/my-app/components/ui/NopInfoModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("setSelectedYear(data.INFORMASI_RINCI_OBJEK_PAJAK[0].TAHUN_PAJAK);", "setSelectedYear(data!.INFORMASI_RINCI_OBJEK_PAJAK[0].TAHUN_PAJAK);")
content = content.replace("setSelectedBangunan(data.INFORMASI_BANGUNAN[0].NO_BNG);", "setSelectedBangunan(data!.INFORMASI_BANGUNAN[0].NO_BNG);")

with open('/home/wgipro/koding/newmap/my-app/components/ui/NopInfoModal.tsx', 'w') as f:
    f.write(content)
