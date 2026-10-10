import re

with open('/home/wgipro/koding/next/leaflet/src/components/TematikLayer.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(r"// Color palette.*?export function getCategoryColor.*?return stringToColor\(category, tematik \|\| 'default'\);\n}", re.DOTALL)
match = pattern.search(content)

if match:
    code = match.group(0)
    # The code relies on stringToColor which is inside TematikLayer. Let's find stringToColor.
    string_to_color_pattern = re.compile(r"function stringToColor.*?}\n", re.DOTALL)
    match2 = string_to_color_pattern.search(content)
    if match2:
        code = match2.group(0) + '\n\n' + code
    
    # ensure exported
    code = code.replace("const jenisTanahColors", "export const jenisTanahColors")
    code = code.replace("const jenisBangunanColors", "export const jenisBangunanColors")
    code = code.replace("const nilaiIndividuColors", "export const nilaiIndividuColors")
    code = code.replace("const nikColors", "export const nikColors")
    code = code.replace("const ketetapanPerBukuColors", "export const ketetapanPerBukuColors")
    code = code.replace("const statusPembayaranColors", "export const statusPembayaranColors")
    code = code.replace("const UNIQUE_COLOR_PALETTE", "export const UNIQUE_COLOR_PALETTE")
    code = code.replace("function stringToColor", "export function stringToColor")
    
    with open('/home/wgipro/koding/newmap/my-app/lib/tematikColors.ts', 'w') as f:
        f.write(code)
