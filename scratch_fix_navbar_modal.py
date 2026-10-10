import re

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { ChangePasswordModal } from '@/components/ui/ChangePasswordModal';", "import ChangePasswordModal from '@/components/ui/ChangePasswordModal';")
content = content.replace("<ChangePasswordModal onClose=", "<ChangePasswordModal isOpen={showChangePassword} onClose=")

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'w') as f:
    f.write(content)
