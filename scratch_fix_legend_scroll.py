import re

with open('/home/wgipro/koding/newmap/my-app/components/map/Legend.tsx', 'r') as f:
    content = f.read()

# Fix tematik legend
content = content.replace(
    'className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg p-3 shadow-md min-w-[200px] max-w-[300px] max-h-[300px] overflow-y-auto"',
    'className="pointer-events-auto bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg p-3 shadow-md min-w-[200px] max-w-[300px] max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"'
)

# Fix normal legend
content = content.replace(
    'className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg p-3 shadow-md min-w-[150px]"',
    'className="pointer-events-auto bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg p-3 shadow-md min-w-[150px]"'
)

with open('/home/wgipro/koding/newmap/my-app/components/map/Legend.tsx', 'w') as f:
    f.write(content)
