import re

# 1. Fix lib/auth.ts missing canUserManage
with open('/home/wgipro/koding/newmap/my-app/lib/auth.ts', 'r') as f:
    content = f.read()

if 'canUserManage' not in content:
    content += "\n// Check if user can manage users\nexport function canUserManage(role: UserRole): boolean {\n    return role === 'admin';\n}\n"

with open('/home/wgipro/koding/newmap/my-app/lib/auth.ts', 'w') as f:
    f.write(content)


# 2. Fix app/api/polygons/save/route.ts missing getPool
with open('/home/wgipro/koding/newmap/my-app/app/api/polygons/save/route.ts', 'r') as f:
    content = f.read()

content = content.replace("import { getPool } from '@/lib/db';", "import { pool } from '@/lib/db';")
content = content.replace("const pool = getPool();", "")

with open('/home/wgipro/koding/newmap/my-app/app/api/polygons/save/route.ts', 'w') as f:
    f.write(content)


# 3. Fix users and usulan pages Navbar
import glob
for page in ['/home/wgipro/koding/newmap/my-app/app/users/page.tsx', '/home/wgipro/koding/newmap/my-app/app/usulan/page.tsx']:
    with open(page, 'r') as f:
        content = f.read()
    
    content = content.replace("import Navbar from '@/components/Navbar';", "import { TopNavbar } from '@/components/ui/TopNavbar';")
    content = content.replace("<Navbar />", "<TopNavbar />")
    
    with open(page, 'w') as f:
        f.write(content)

