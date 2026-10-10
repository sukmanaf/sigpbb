import re

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'r') as f:
    content = f.read()

# Add import
if 'ChangePasswordModal' not in content:
    content = content.replace("import { Pencil,", "import { ChangePasswordModal } from '@/components/ui/ChangePasswordModal';\nimport { Pencil,")

# Add state
if 'showChangePassword' not in content:
    content = content.replace("const [appName, setAppName] = useState('SmartMap');", "const [appName, setAppName] = useState('SmartMap');\n  const [showChangePassword, setShowChangePassword] = useState(false);")

# Replace User Menu
replacement = """            {/* User Menu */}
            <div className="relative ml-2 pl-2 border-l border-emerald-500/30">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold leading-tight">{currentUser?.name || 'Loading...'}</span>
                  <span className="text-xs text-emerald-200 capitalize leading-tight">{currentUser?.role || ''}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <ChevronDown size={14} className={`transition-transform text-white/80 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 text-gray-700 border border-gray-100 animate-in fade-in slide-in-from-top-2 z-[2000]">
                    {canManageUsers && (
                        <Link 
                            href="/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Settings size={16} />
                            Pengaturan
                        </Link>
                    )}
                    <button 
                      onClick={() => { setShowChangePassword(true); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Key size={16} />
                      Ganti Password
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 font-medium"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                </div>
              )}
            </div>"""

content = re.sub(
    r"            \{\/\* User Menu \*\/.*?<\/button>\n            <\/div>",
    replacement,
    content,
    flags=re.DOTALL
)

# Add modal before closing nav
content = content.replace("    </nav>\n  );", "    </nav>\n      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}\n  );")

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'w') as f:
    f.write(content)
