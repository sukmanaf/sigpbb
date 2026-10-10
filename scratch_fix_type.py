import re

with open('/home/wgipro/koding/newmap/my-app/types/map.ts', 'r') as f:
    content = f.read()

content = re.sub(
    r"(export interface NopDetail \{.*?)\}",
    r"\1  pbb?: any;\n}",
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/types/map.ts', 'w') as f:
    f.write(content)
