import re

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'r') as f:
    content = f.read()

# Add useAuth import
if 'useAuth' not in content:
    content = content.replace("import { Layers, ChevronDown, Map, User, Settings, LogOut } from 'lucide-react';", "import { Layers, ChevronDown, Map, User, Settings, LogOut, Users, FileText } from 'lucide-react';\nimport { useAuth } from '@/contexts/AuthContext';")

# Use useAuth instead of local state
replacement = """  const [tematikOpen, setTematikOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user: currentUser, logout, canManageUsers } = useAuth();
  
  // Also we want to render Admin Links
"""

content = re.sub(
    r"  const \[tematikOpen, setTematikOpen\] = useState\(false\);\n  const \[userMenuOpen, setUserMenuOpen\] = useState\(false\);\n  const \[mobileMenuOpen, setMobileMenuOpen\] = useState\(false\);\n  const \[currentUser, setCurrentUser\] = useState<\{username: string, role: string, name: string\} \| null>\(null\);\n\n  useEffect\(\(\) => \{\n    fetch\('/api/auth/me'\)\n      \.then\(res => res\.json\(\)\)\n      \.then\(data => \{\n        if \(data\.success && data\.user\) \{\n           setCurrentUser\(data\.user\);\n        \}\n      \}\)\n      \.catch\(console\.error\);\n  \}, \[\]\);",
    replacement,
    content,
    flags=re.DOTALL
)

# Update logout button
content = re.sub(
    r"                    <button \n                      onClick=\{async \(\) => \{\n                        try \{\n                          await fetch\('/api/auth/logout', \{ method: 'POST' \}\);\n                          window\.location\.href = '/login';\n                        \} catch \(e\) \{\n                          console\.error\(e\);\n                        \}\n                      \}\}",
    r"                    <button \n                      onClick={logout}",
    content,
    flags=re.DOTALL
)

# Add admin links
admin_links = """            </Link>

            {/* Admin Links */}
            {canManageUsers && (
              <Link href="/users" className="px-3 py-2 rounded-lg text-emerald-50 hover:bg-white/10 hover:text-white font-medium flex items-center gap-2 transition-colors">
                <Users size={16} />
                <span>Users</span>
              </Link>
            )}
            
            {(currentUser?.role === 'admin' || currentUser?.role === 'bapenda') && (
              <Link href="/usulan" className="px-3 py-2 rounded-lg text-emerald-50 hover:bg-white/10 hover:text-white font-medium flex items-center gap-2 transition-colors">
                <FileText size={16} />
                <span>Usulan</span>
              </Link>
            )}

            {/* Tematik Dropdown */}"""

content = content.replace("            </Link>\n\n            {/* Tematik Dropdown */}", admin_links)

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'w') as f:
    f.write(content)
