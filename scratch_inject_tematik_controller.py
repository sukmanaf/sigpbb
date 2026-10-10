import re

with open('/home/wgipro/koding/newmap/my-app/app/map/page.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { NopInfoModal } from '@/components/ui/NopInfoModal';", "import { NopInfoModal } from '@/components/ui/NopInfoModal';\nimport { TematikController } from '@/components/map/TematikController';")

content = content.replace("<MapUIOverlay />", "<MapUIOverlay />\n          <TematikController />")

with open('/home/wgipro/koding/newmap/my-app/app/map/page.tsx', 'w') as f:
    f.write(content)
