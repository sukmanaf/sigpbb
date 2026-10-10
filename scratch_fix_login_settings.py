import re

with open('/home/wgipro/koding/newmap/my-app/app/login/page.tsx', 'r') as f:
    content = f.read()

old_vars = """    // Hardcoded for now, can be fetched from DB
    const appNameShort = 'SmartMap';
    const appName = 'Sistem Informasi Geografis Bapenda';
    const institutionName = 'BAPENDA';
    const router = useRouter();"""

new_vars = """    const [appNameShort, setAppNameShort] = useState('SmartMap');
    const [appName, setAppName] = useState('Sistem Informasi Geografis Bapenda');
    const [institutionName, setInstitutionName] = useState('BAPENDA');
    const [appLogo, setAppLogo] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data.success) {
                    if (data.data.app_name_short) setAppNameShort(data.data.app_name_short);
                    if (data.data.app_name) setAppName(data.data.app_name);
                    if (data.data.app_logo) setAppLogo(data.data.app_logo);
                    if (data.data.institution_name) setInstitutionName(data.data.institution_name);
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            }
        }
        fetchSettings();
    }, []);"""

content = content.replace(old_vars, new_vars)

# Also update the UI to show the logo if it exists
old_ui = """                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
                        <span className="text-3xl font-bold text-white tracking-tighter">S<span className="text-emerald-200">M</span></span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 text-center">{appNameShort}</h1>
                    <p className="text-sm text-gray-600 text-center max-w-xs mt-1">{appName}</p>
                </div>"""

new_ui = """                <div className="flex flex-col items-center justify-center mb-8">
                    {appLogo ? (
                        <div className="w-20 h-20 mb-4 flex items-center justify-center">
                            <img src={appLogo} alt="App Logo" className="max-w-full max-h-full object-contain" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
                            <span className="text-3xl font-bold text-white tracking-tighter">S<span className="text-emerald-200">M</span></span>
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-gray-800 text-center">{appNameShort}</h1>
                    <p className="text-sm text-gray-600 text-center max-w-xs mt-1">{appName}</p>
                </div>"""

content = content.replace(old_ui, new_ui)

# Update <title> or small texts if institutionName is used
# Let's check if institutionName is used anywhere in the login page
content = content.replace("© 2026 BAPENDA", "© {new Date().getFullYear()} {institutionName}")

with open('/home/wgipro/koding/newmap/my-app/app/login/page.tsx', 'w') as f:
    f.write(content)
