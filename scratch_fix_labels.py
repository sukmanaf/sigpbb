import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'r') as f:
    content = f.read()

# Match the Label layer block
pattern = r"          // Label layer \(bloks only here\)\n          if \(layerName === 'bloks'\) \{.*?            \}\);\n          \}"

replacement = """
          // Label layer (bloks & bangunans)
          if (layerName === 'bloks' || layerName === 'bangunans') {
            const textField = layerName === 'bloks' 
              ? ['slice', ['get', 'd_blok'], 10, 13] 
              : ['slice', ['get', 'd_nop'], 13, 17];
              
            const textColor = layerName === 'bloks' ? '#000000' : '#ffffff';
            const haloColor = layerName === 'bloks' ? '#ffffff' : '#000000';
            const textSize = layerName === 'bloks' ? 14 : 10;
            const haloWidth = layerName === 'bloks' ? 2 : 1;
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const labelConfig: any = {
              id: `${layerName}-label`,
              type: 'symbol',
              source: layerName,
              'source-layer': layerName,
              layout: {
                'text-field': textField,
                'text-size': textSize,
                'text-anchor': 'center',
                visibility: 'none',
              },
              paint: {
                'text-color': textColor,
                'text-halo-color': haloColor,
                'text-halo-width': haloWidth,
              },
            };

            if (layerName === 'bangunans') {
               labelConfig.minzoom = 16;
            }

            map.addLayer(labelConfig);
          }
"""

content = re.sub(pattern, replacement.strip('\n'), content, flags=re.DOTALL)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'w') as f:
    f.write(content)
