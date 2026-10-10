import re

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'r') as f:
    content = f.read()

replacement = """              <button 
                onClick={() => setTematikOpen(!tematikOpen)}
                className={`px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 ${
                   ctx?.activeTematik 
                     ? 'bg-teal-800/40 text-white shadow-inner ring-1 ring-white/20' 
                     : 'text-white hover:bg-white/10'
                }`}
              >
                <Layers size={16} className={ctx?.activeTematik ? "text-teal-200" : "text-emerald-100"} />
                {ctx?.activeTematik ? tematikItems.find(i => i.id === ctx?.activeTematik)?.name : 'Tematik'}
                {ctx?.tematikLoading && <span className="ml-1 w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>}
                <ChevronDown size={14} className={`transition-transform ${tematikOpen ? 'rotate-180' : ''}`} />
              </button>"""

content = re.sub(
    r"              <button \n                onClick=\{\(\) => setTematikOpen\(!tematikOpen\)\}.*?</button>",
    replacement,
    content,
    flags=re.DOTALL
)

dropdown_item_replacement = """                    {tematikItems.map((item) => (
                      <button 
                        key={item.id} 
                        onClick={() => {
                          if (ctx?.activeTematik === item.id) {
                            ctx?.setActiveTematik(null);
                          } else {
                            ctx?.setActiveTematik(item.id);
                          }
                          setTematikOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center gap-2 border-l-2 ${
                          ctx?.activeTematik === item.id 
                            ? 'bg-teal-50 text-teal-700 font-semibold border-teal-500' 
                            : 'text-gray-600 hover:bg-gray-50 border-transparent hover:border-gray-200'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${ctx?.activeTematik === item.id ? 'bg-teal-500' : 'bg-transparent'}`}></div>
                        {item.name}
                      </button>
                    ))}"""

content = re.sub(
    r"                    \{tematikItems\.map\(\(item\) => \(.*?                    \)\)\}",
    dropdown_item_replacement,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'w') as f:
    f.write(content)
