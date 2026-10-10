import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

# 1. Extract the hooks from the bottom
hooks_pattern = r'  // Toggle Clear Button Visibility\n  useEffect\(\(\) => \{[\s\S]*?\}, \[ctx\]\);\n'
match = re.search(hooks_pattern, content)
if match:
    hooks_code = match.group(0)
    # Remove from bottom
    content = content.replace(hooks_code, '')
    
    # 2. Insert at the top after `const [showBulkSaveBtn, setShowBulkSaveBtn] = useState(false);`
    insertion_point = '  const [showBulkSaveBtn, setShowBulkSaveBtn] = useState(false);\n'
    content = content.replace(insertion_point, insertion_point + "\n" + hooks_code)
    
    with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
        f.write(content)
    print("Hooks moved successfully.")
else:
    print("Could not find the hooks block at the bottom.")
