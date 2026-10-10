import re

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'r') as f:
    content = f.read()

replacement = """                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <Settings size={16} className="text-gray-400" />
                      Ganti Password
                    </button>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button 
                      onClick={async () => {
                        try {
                          await fetch('/api/auth/logout', { method: 'POST' });
                          window.location.href = '/login';
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut size={16} className="text-red-400" />
                      Logout
                    </button>"""

content = re.sub(
    r'                    <button className="w-full text-left px-4 py-2\.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">\n                      <Settings size=\{16\} className="text-gray-400" />\n                      Ganti Password\n                    </button>\n                    <div className="h-px bg-gray-100 my-1"></div>\n                    <button className="w-full text-left px-4 py-2\.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">\n                      <LogOut size=\{16\} className="text-red-400" />\n                      Logout\n                    </button>',
    replacement,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'w') as f:
    f.write(content)
