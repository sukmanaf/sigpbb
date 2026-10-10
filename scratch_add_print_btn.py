import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapUIOverlay.tsx', 'r') as f:
    content = f.read()

# Add Printer icon import
content = content.replace("import { Search, Layers } from 'lucide-react';", "import { Search, Layers, Printer } from 'lucide-react';")

# Add the print button
print_button = """
        <button
          onClick={() => window.print()}
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition-colors border border-gray-200"
          title="Cetak Peta (Print)"
        >
          <Printer size={20} />
        </button>"""

content = content.replace("title=\"Layer Control\"\n        >\n          <Layers size={20} />\n        </button>", "title=\"Layer Control\"\n        >\n          <Layers size={20} />\n        </button>" + print_button)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapUIOverlay.tsx', 'w') as f:
    f.write(content)
