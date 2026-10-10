import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

# I need to change:
#     if (ctx.selectedDesa) {
#       if (!drawControlRef.current) {
# TO
#     if (true) {
#       if (!drawControlRef.current) {

content = content.replace("    if (ctx.selectedDesa) {\n      if (!drawControlRef.current) {", "    if (true) {\n      if (!drawControlRef.current) {")
content = content.replace("    if (ctx.selectedDesa) {\r\n      if (!drawControlRef.current) {", "    if (true) {\r\n      if (!drawControlRef.current) {")


# Also need to fix the dependency array for the effect to not unmount when selectedDesa changes, but it's currently:
#   }, [ctx?.map, ctx?.selectedDesa]); 
# Let's check it.
