import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

# Add !canEdit to useEffect 1
content = content.replace("    const map = ctx?.map;\n    if (!map) return;\n\n    if (ctx.selectedDesa) {", "    const map = ctx?.map;\n    if (!map || !canEdit) return;\n\n    if (ctx.selectedDesa) {")

# Also to useEffect 2
content = content.replace("  useEffect(() => {\n    const handleToggle", "  useEffect(() => {\n    if (!canEdit) return;\n    const handleToggle")

# Also to useEffect 3
content = content.replace("  useEffect(() => {\n    const editBtn = document.querySelector", "  useEffect(() => {\n    if (!canEdit) return;\n    const editBtn = document.querySelector")

# Also to useEffect 4
content = content.replace("  useEffect(() => {\n    const map = ctx?.map;\n    if (!map) return;\n\n    if ((ctx?.mode === 'edit' || ctx?.mode === 'fast-edit') && drawControlRef.current) {", "  useEffect(() => {\n    const map = ctx?.map;\n    if (!map || !canEdit) return;\n\n    if ((ctx?.mode === 'edit' || ctx?.mode === 'fast-edit') && drawControlRef.current) {")

# Also to useEffect 5
content = content.replace("  useEffect(() => {\n    if (ctx?.mode === 'view' && drawControlRef.current) {", "  useEffect(() => {\n    if (!canEdit) return;\n    if (ctx?.mode === 'view' && drawControlRef.current) {")


with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)
