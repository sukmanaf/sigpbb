import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

# Using a simpler string replacement since we know the exact text block roughly
start_token = "{/* Clear Desa Button */}"
end_token = "{/* Fast Edit Save Button */}"

start_idx = content.find(start_token)
end_idx = content.find(end_token)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + content[end_idx:]
    with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
        f.write(content)
    print("Successfully removed the JSX block.")
else:
    print("Could not find the tokens.")
