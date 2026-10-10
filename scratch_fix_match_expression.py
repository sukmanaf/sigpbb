import re

with open('/home/wgipro/koding/newmap/my-app/components/map/TematikController.tsx', 'r') as f:
    content = f.read()

replacement = """        const matchExpression: any[] = ['match', ['get', 'd_nop']];
        const seenNops = new Set<string>();
        
        Object.entries(data).forEach(([category, items]) => {
           const color = getCategoryColor(category, activeTematik);
           (items as any[]).forEach(item => {
               const nop18 = item.NOP.replace(/[.\-]/g, '');
               if (!seenNops.has(nop18)) {
                   seenNops.add(nop18);
                   matchExpression.push(nop18, color);
               }
           });
        });"""

content = re.sub(
    r"        const matchExpression: any\[\] = \['match', \['get', 'd_nop'\]\];\n        \n        Object\.entries\(data\)\.forEach\(\(\[category, items\]\) => \{\n           const color = getCategoryColor\(category, activeTematik\);\n           \(\(items as any\[\]\)\.forEach\(item => \{\n               const nop18 = item\.NOP\.replace\(/\[\.\\-\]/g, ''\);\n               matchExpression\.push\(nop18, color\);\n           \}\);\n        \}\);",
    replacement,
    content,
    flags=re.DOTALL
)

# wait the original didn't have ((items as any[])
# let's be safe
replacement2 = """        const matchExpression: any[] = ['match', ['get', 'd_nop']];
        const seenNops = new Set<string>();
        
        Object.entries(data).forEach(([category, items]) => {
           const color = getCategoryColor(category, activeTematik);
           (items as any[]).forEach(item => {
               const nop18 = item.NOP.replace(/[.\-]/g, '');
               if (!seenNops.has(nop18)) {
                   seenNops.add(nop18);
                   matchExpression.push(nop18, color);
               }
           });
        });"""

content2 = re.sub(
    r"        const matchExpression: any\[\] = \['match', \['get', 'd_nop'\]\];\n        \n        Object\.entries\(data\)\.forEach\(\(\[category, items\]\) => \{\n           const color = getCategoryColor\(category, activeTematik\);\n           \(items as any\[\]\)\.forEach\(item => \{\n               const nop18 = item\.NOP\.replace\(/\[\.\\-\]/g, ''\);\n               matchExpression\.push\(nop18, color\);\n           \}\);\n        \}\);",
    replacement2,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/components/map/TematikController.tsx', 'w') as f:
    f.write(content2)
