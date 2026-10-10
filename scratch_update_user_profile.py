import re

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'r') as f:
    content = f.read()

replacement = """  const [tematikOpen, setTematikOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{username: string, role: string, name: string} | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
           setCurrentUser(data.user);
        }
      })
      .catch(console.error);
  }, []);"""

content = re.sub(
    r"  const \[tematikOpen, setTematikOpen\] = useState\(false\);\n  const \[userMenuOpen, setUserMenuOpen\] = useState\(false\);\n  const \[mobileMenuOpen, setMobileMenuOpen\] = useState\(false\);",
    replacement,
    content,
    flags=re.DOTALL
)

replacement2 = """                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-white leading-tight">{currentUser?.name || 'Loading...'}</div>
                  <div className="text-xs text-emerald-100 capitalize">{currentUser?.role || ''}</div>
                </div>"""

content = re.sub(
    r'                <div className="text-right hidden sm:block">\n                  <div className="text-sm font-bold text-white leading-tight">admin</div>\n                  <div className="text-xs text-emerald-100">Admin</div>\n                </div>',
    replacement2,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'w') as f:
    f.write(content)
