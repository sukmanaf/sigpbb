import re

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'r') as f:
    content = f.read()

# Find export function TopNavbar() {
# ...
#   const user = { username: 'admin', role: 'admin' };

replacement = """export function TopNavbar() {
  const ctx = useContext(MapContext);
  const [tematikOpen, setTematikOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [appName, setAppName] = useState('SmartMap');
  
  const { user: currentUser, logout, canManageUsers, canEdit } = useAuth();
  const editMode = ctx?.mode === 'edit';"""

content = re.sub(
    r"export function TopNavbar\(\) \{\n  const ctx = useContext\(MapContext\);\n  const \[tematikOpen, setTematikOpen\] = useState\(false\);\n  const \[userMenuOpen, setUserMenuOpen\] = useState\(false\);\n  const \[appName, setAppName\] = useState\('SmartMap'\);\n  \n  const user = \{ username: 'admin', role: 'admin' \};\n  const canEdit = true;\n  const editMode = ctx\?\.mode === 'edit';",
    replacement,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'w') as f:
    f.write(content)
