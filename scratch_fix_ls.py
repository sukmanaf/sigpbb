import re

with open('/home/wgipro/koding/newmap/my-app/components/providers/MapProvider.tsx', 'r') as f:
    content = f.read()

replacement = """
  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smartmap_layer_styles');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migration check from old format
        if (parsed.desas && parsed.desas.color) {
           console.log("Old cache format detected. Using default styles instead.");
           localStorage.removeItem('smartmap_layer_styles');
        } else {
           setLayerStyles(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load layer styles from cache', e);
    }
  }, []);
"""

content = re.sub(r"  // Load from LocalStorage on mount.*?  }, \[\]\);", replacement.strip(), content, flags=re.DOTALL)

with open('/home/wgipro/koding/newmap/my-app/components/providers/MapProvider.tsx', 'w') as f:
    f.write(content)
