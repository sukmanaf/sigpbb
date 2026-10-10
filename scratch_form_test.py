import re

with open('/home/wgipro/koding/newmap/my-app/app/login/page.tsx', 'r') as f:
    content = f.read()

content = content.replace('id="username"', 'id="username" name="username"')
content = content.replace('id="password"', 'id="password" name="password"')
# also add an alert on submit to see if JS is running
content = content.replace('e.preventDefault();', 'e.preventDefault();\n        alert("JS is running!");')

with open('/home/wgipro/koding/newmap/my-app/app/login/page.tsx', 'w') as f:
    f.write(content)
