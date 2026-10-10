import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

# 1. Add modeRef
ref_code = """  const [drawnCoordinates, setDrawnCoordinates] = useState<any[]>([]);
  const modeRef = useRef(ctx?.mode);
  
  useEffect(() => {
    modeRef.current = ctx?.mode;
  }, [ctx?.mode]);"""

content = content.replace("  const [drawnCoordinates, setDrawnCoordinates] = useState<any[]>([]);", ref_code)

# 2. Change ctx.mode to modeRef.current in handleCreate
old_check = "if (ctx.mode === 'bulk-edit') {"
new_check = "if (modeRef.current === 'bulk-edit') {"

content = content.replace(old_check, new_check)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)
