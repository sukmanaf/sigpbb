import re

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'r') as f:
    content = f.read()

# Add logo state and fetch logic
old_state = """  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [appName, setAppName] = useState('SmartMap');
  const [showChangePassword, setShowChangePassword] = useState(false);"""

new_state = """  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [appName, setAppName] = useState('SmartMap');
  const [appLogo, setAppLogo] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success) {
          if (data.data.app_name_short) setAppName(data.data.app_name_short);
          if (data.data.app_logo) setAppLogo(data.data.app_logo);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    }
    fetchSettings();
  }, []);"""

content = content.replace(old_state, new_state)

# Replace the logo UI
old_ui = """            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => router.push('/map')}>
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3 border border-white/30">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">{appName}</span>
            </div>"""

new_ui = """            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => router.push('/map')}>
              {appLogo ? (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 overflow-hidden bg-white/90">
                  <img src={appLogo} alt="App Logo" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3 border border-white/30">
                  <Globe className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="font-bold text-xl tracking-tight hidden sm:block">{appName}</span>
            </div>"""

content = content.replace(old_ui, new_ui)

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'w') as f:
    f.write(content)
