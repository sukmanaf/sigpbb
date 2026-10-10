import re

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'r') as f:
    content = f.read()

# Add Map to lucide-react imports if it's not there
if 'Map,' not in content and 'Map ' not in content:
    content = content.replace("import { Pencil, Layers, ChevronDown,", "import { Pencil, Layers, ChevronDown, Map,")

replacement = """            <Link href="/map" className="px-3 py-2 rounded-lg bg-teal-800/40 text-white shadow-inner ring-1 ring-white/20 font-medium flex items-center gap-2 transition-all">
              <Map size={16} className="text-emerald-200" />
              <span>Map</span>
            </Link>"""

content = re.sub(
    r'            <Link href="/map".*?            </Link>',
    replacement,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'w') as f:
    f.write(content)
