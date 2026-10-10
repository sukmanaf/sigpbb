import re

with open('/home/wgipro/koding/newmap/my-app/components/providers/MapProvider.tsx', 'r') as f:
    content = f.read()

# Make sure we import useEffect
if 'useEffect' not in content:
    content = content.replace('import { createContext, useState, ReactNode } from \'react\';', 
                              'import { createContext, useState, useEffect, ReactNode } from \'react\';')

# Add the useEffect hooks right after useState declarations
hooks = """
  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smartmap_layer_styles');
      if (saved) {
        setLayerStyles(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load layer styles from cache', e);
    }
  }, []);

  // Save to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('smartmap_layer_styles', JSON.stringify(layerStyles));
  }, [layerStyles]);
"""

# Insert before `return (`
idx = content.find('  return (')
new_content = content[:idx] + hooks + '\n' + content[idx:]

with open('/home/wgipro/koding/newmap/my-app/components/providers/MapProvider.tsx', 'w') as f:
    f.write(new_content)

