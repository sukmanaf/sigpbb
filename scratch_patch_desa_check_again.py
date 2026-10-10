import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

# Replace:
#     if (ctx.selectedDesa) {
#       if (!drawControlRef.current) {
# with:
#     if (true) {
#       if (!drawControlRef.current) {

content = re.sub(
    r'if\s*\(\s*ctx\.selectedDesa\s*\)\s*\{\s*if\s*\(\s*!drawControlRef\.current\s*\)\s*\{',
    'if (true) {\n      if (!drawControlRef.current) {',
    content,
    flags=re.MULTILINE
)

# And also we need to fix the cleanup part
#     } else {
#       if (drawControlRef.current) {
#         if ((drawControlRef as any)._handleCreate) {

# Actually, if (true) will make the `else` block unreachable, which is fine!
# But let's check if the regex matched.
with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)

