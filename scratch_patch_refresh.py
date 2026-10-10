import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

old_refresh = """               // Force map source refresh
               const map = ctx?.map;
               if (map) {
                   const layer = 'nops';
                   const source = map.getSource(layer);
                   if (source?.setTiles) {
                       source.setTiles([`/api/tiles/${layer}/{z}/{x}/{y}?desa=${ctx.selectedDesa}&t=${Date.now()}`]);
                       if ((source as any).clearTiles) (source as any).clearTiles();
                   }
               }"""

new_refresh = """               // Force map source refresh
               const map = ctx?.map;
               if (map) {
                   ['nops', 'bloks', 'bangunans'].forEach(layer => {
                       const source = map.getSource(layer);
                       if (source && (source as any).setTiles) {
                           (source as any).setTiles([`/api/tiles/${layer}/{z}/{x}/{y}?desa=${ctx.selectedDesa}&t=${Date.now()}`]);
                           if ((source as any).clearTiles) (source as any).clearTiles();
                       }
                   });
               }"""

content = content.replace(old_refresh, new_refresh)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)
