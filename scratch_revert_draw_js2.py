import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

# Replace the broken useEffect #3
broken_useEffect = r"  \/\/ 3\. Highlight the custom edit button based on mode.*?  }, \[ctx\?\.mode\]\);"

fixed_useEffect = """  // 3. Highlight the custom edit button based on mode (using theme green)
  useEffect(() => {
    if (!canEdit) return;
    const editBtn = document.querySelector('.custom-edit-toggle-btn') as HTMLElement;
    const fastEditBtn = document.querySelector('.custom-fast-edit-toggle-btn') as HTMLElement;
    
    if (editBtn) {
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
    }
  }, [ctx?.mode]);"""

content = re.sub(broken_useEffect, fixed_useEffect, content, flags=re.DOTALL)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)
