import re

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'r') as f:
    content = f.read()

replacement = """              <button 
                onClick={() => setTematikOpen(!tematikOpen)}
                className={`px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                   ctx?.activeTematik 
                     ? 'bg-emerald-100 text-emerald-800' 
                     : 'text-emerald-50 hover:bg-white/10'
                }`}
              >
                <Layers size={16} />
                {ctx?.activeTematik ? tematikItems.find(i => i.id === ctx.activeTematik)?.name : 'Tematik'}
                {ctx?.tematikLoading && <span className="ml-1 w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>}
                <ChevronDown size={14} className={`transition-transform ${tematikOpen ? 'rotate-180' : ''}`} />
              </button>"""

content = re.sub(r"              <button \n                onClick=\{\(\) => setTematikOpen\(!tematikOpen\)\}\n                className=.*?<ChevronDown.*?/>\n              </button>", replacement, content, flags=re.DOTALL)

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'w') as f:
    f.write(content)
