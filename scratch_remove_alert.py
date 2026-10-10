import re

with open('/home/wgipro/koding/newmap/my-app/app/login/page.tsx', 'r') as f:
    content = f.read()

content = content.replace('e.preventDefault();\n        alert("JS is running!");', 'e.preventDefault();')

with open('/home/wgipro/koding/newmap/my-app/app/login/page.tsx', 'w') as f:
    f.write(content)
