import re

with open('/home/wgipro/koding/next/leaflet/src/components/TematikLayer.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(r"// Module level cache for consistent color assignment.*?export const TEMATIK_FILL_OPACITY = 0\.35;", re.DOTALL)
match = pattern.search(content)

if match:
    code = match.group(0)
    
    # We need to prepend UNIQUE_COLOR_PALETTE
    palette_pattern = re.compile(r"const UNIQUE_COLOR_PALETTE: string\[\] = \[.*?\];", re.DOTALL)
    p_match = palette_pattern.search(content)
    if p_match:
        code = p_match.group(0).replace("const UNIQUE_COLOR_PALETTE", "export const UNIQUE_COLOR_PALETTE") + '\n\n' + code
        
    code = code.replace("const jenisTanahColors", "export const jenisTanahColors")
    code = code.replace("const jenisBangunanColors", "export const jenisBangunanColors")
    
    with open('/home/wgipro/koding/newmap/my-app/lib/tematikColors.ts', 'w') as f:
        f.write(code)
