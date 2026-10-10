import re

with open('/home/wgipro/koding/newmap/my-app/app/settings/page.tsx', 'r') as f:
    content = f.read()

# Replace Navbar import
content = content.replace("import Navbar from '@/components/Navbar';", "import { TopNavbar } from '@/components/ui/TopNavbar';")

# Replace <Navbar /> tag
content = content.replace("<Navbar />", "<TopNavbar />")

with open('/home/wgipro/koding/newmap/my-app/app/settings/page.tsx', 'w') as f:
    f.write(content)
