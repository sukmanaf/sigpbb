import re

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'r') as f:
    content = f.read()

# 1. Update Map button
map_btn_replacement = """            <Link href="/map" className="px-3 py-2 rounded-lg text-emerald-50 hover:bg-white/10 hover:text-white font-medium flex items-center gap-2 transition-colors">
              <Map size={16} />
              <span>Map</span>
            </Link>"""

content = re.sub(
    r'            <Link href="/map".*?            </Link>',
    map_btn_replacement,
    content,
    flags=re.DOTALL
)

# 2. Update Tematik button
tematik_btn_replacement = """              <button 
                onClick={() => setTematikOpen(!tematikOpen)}
                className={`px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                   ctx?.activeTematik || tematikOpen
                     ? 'bg-white/10 text-white' 
                     : 'text-emerald-50 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Layers size={16} />
                {ctx?.activeTematik ? tematikItems.find(i => i.id === ctx?.activeTematik)?.name : 'Tematik'}
                {ctx?.tematikLoading && <span className="ml-1 w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>}
                <ChevronDown size={14} className={`transition-transform ${tematikOpen ? 'rotate-180' : ''}`} />
              </button>"""

content = re.sub(
    r"              <button \n                onClick=\{\(\) => setTematikOpen\(!tematikOpen\)\}.*?              </button>",
    tematik_btn_replacement,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'w') as f:
    f.write(content)
