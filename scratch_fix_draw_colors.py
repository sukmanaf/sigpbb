import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

content = content.replace("editBtn.style.color = '#333333';", "")
content = content.replace("fastEditBtn.style.color = '#333333';", "")
content = content.replace("editBtn.style.color = '#059669';", "editBtn.classList.add('active');")
content = content.replace("editBtn.style.color = '';", "editBtn.classList.remove('active');")
content = content.replace("editBtn.style.backgroundColor = '#ecfdf5';", "")
content = content.replace("editBtn.style.backgroundColor = '';", "")

content = content.replace("fastEditBtn.style.color = '#059669';", "fastEditBtn.classList.add('active');")
content = content.replace("fastEditBtn.style.color = '';", "fastEditBtn.classList.remove('active');")
content = content.replace("fastEditBtn.style.backgroundColor = '#ecfdf5';", "")
content = content.replace("fastEditBtn.style.backgroundColor = '';", "")

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)
