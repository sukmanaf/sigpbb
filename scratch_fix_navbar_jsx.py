import re

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'r') as f:
    content = f.read()

replacement = """  return (
    <>
      <nav className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md relative z-50">"""

content = content.replace('  return (\n    <nav className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md relative z-50">', replacement)

replacement_bottom = """    </nav>
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </>
  );"""

content = content.replace('    </nav>\n      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}\n  );', replacement_bottom)

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'w') as f:
    f.write(content)
