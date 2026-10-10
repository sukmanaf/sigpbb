import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'r') as f:
    content = f.read()

old_refresh = """                           if ((source as any).clearTiles) (source as any).clearTiles();
                       }
                   });
               }"""

new_refresh = """                           if ((source as any).clearTiles) (source as any).clearTiles();
                       }
                   });
                   // Refresh desas geojson if it was edited
                   const desasSource = map.getSource('desas');
                   if (desasSource && (desasSource as any).setData) {
                       fetch('/api/desas/all').then(r => r.json()).then(data => (desasSource as any).setData(data));
                   }
               }"""

content = content.replace(old_refresh, new_refresh)

# Also fix the click handler in MapDrawCtrl to query desas-fill
old_click = """          const features = map.queryRenderedFeatures(e.point, { layers: ['nops-fill', 'bloks-fill', 'bangunans-fill'] });"""
new_click = """          const features = map.queryRenderedFeatures(e.point, { layers: ['nops-fill', 'bloks-fill', 'bangunans-fill', 'desas-fill'] });"""

content = content.replace(old_click, new_click)

# And fix the type parsing in click handler
old_type_parse = """            const type = feature.sourceLayer === 'nops' ? 'nop' : feature.sourceLayer === 'bloks' ? 'blok' : 'bangunan';
            const code = feature.properties.d_nop || feature.properties.d_blok || feature.properties.id || '';"""

new_type_parse = """            const type = feature.sourceLayer === 'nops' ? 'nop' : feature.sourceLayer === 'bloks' ? 'blok' : feature.sourceLayer === 'bangunans' ? 'bangunan' : 'desa';
            const code = feature.properties.d_nop || feature.properties.d_blok || feature.properties.d_kd_kel || feature.properties.id || '';"""

content = content.replace(old_type_parse, new_type_parse)

# Note: for desas-fill, it is NOT an MVT layer, so feature.sourceLayer is undefined!
# GeoJSON sources don't have sourceLayer. 
# We should check feature.layer.id instead!
old_type_parse2 = """            const type = feature.sourceLayer === 'nops' ? 'nop' : feature.sourceLayer === 'bloks' ? 'blok' : feature.sourceLayer === 'bangunans' ? 'bangunan' : 'desa';"""

new_type_parse2 = """            let type = 'nop';
            if (feature.layer.id.includes('nops')) type = 'nop';
            else if (feature.layer.id.includes('bloks')) type = 'blok';
            else if (feature.layer.id.includes('bangunans')) type = 'bangunan';
            else if (feature.layer.id.includes('desas')) type = 'desa';"""

content = content.replace(new_type_parse, new_type_parse2 + "\n            const code = feature.properties.d_nop || feature.properties.d_blok || feature.properties.d_kd_kel || feature.properties.id || '';")


with open('/home/wgipro/koding/newmap/my-app/components/map/MapDrawCtrl.tsx', 'w') as f:
    f.write(content)
