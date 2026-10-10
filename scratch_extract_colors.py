import re

with open('/home/wgipro/koding/next/leaflet/src/components/TematikLayer.tsx', 'r') as f:
    content = f.read()

# I will write a simple python script to copy the top part of the file
lines = content.split('\n')
palette_lines = []
in_palette = False
for line in lines:
    if line.startswith('// Color palette') or line.startswith('const jenisTanahColors'):
        in_palette = True
    if line.startswith('export function getCategoryColor'):
        break
    if in_palette:
        palette_lines.append(line)

with open('/home/wgipro/koding/newmap/my-app/lib/tematikColors.ts', 'w') as f:
    f.write('export ' + '\nexport '.join([l if l.startswith('const ') else l for l in palette_lines]))
