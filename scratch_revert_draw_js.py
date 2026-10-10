import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

# Restore editBtn and fastEditBtn inline color logic
content = content.replace("            editBtn.innerHTML =", "            editBtn.style.color = '#333333';\n            editBtn.innerHTML =")
content = content.replace("            fastEditBtn.innerHTML =", "            fastEditBtn.style.color = '#333333';\n            fastEditBtn.innerHTML =")

# Restore the active toggle styling in useEffect #3
active_logic_old = """    if (editBtn) {
      if (ctx?.mode === 'edit') {
        editBtn.classList.add('active');
      } else {
        editBtn.classList.remove('active');
      }
    }
    
    if (fastEditBtn) {
      if (ctx?.mode === 'fast-edit') {
        fastEditBtn.classList.add('active');
      } else {
        fastEditBtn.classList.remove('active');
      }
    }"""

active_logic_new = """    if (editBtn) {
      if (ctx?.mode === 'edit') {
        editBtn.style.color = '#059669'; editBtn.style.backgroundColor = '#ecfdf5';
      } else {
        editBtn.style.color = '#333333'; editBtn.style.backgroundColor = '';
      }
    }
    
    if (fastEditBtn) {
      if (ctx?.mode === 'fast-edit') {
        fastEditBtn.style.color = '#059669'; fastEditBtn.style.backgroundColor = '#ecfdf5';
      } else {
        fastEditBtn.style.color = '#333333'; fastEditBtn.style.backgroundColor = '';
      }
    }"""

content = content.replace(active_logic_old, active_logic_new)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)
