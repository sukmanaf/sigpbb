import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'r') as f:
    content = f.read()

old_logic = """      // Fallback URL if no API key or session fails
      let tileUrl = `https://mt1.google.com/vt/lyrs=${mapType === 'google-satellite' || mapType === 'google-hybrid' ? 's' : mapType === 'google-terrain' ? 'p' : 'm'}&x={x}&y={y}&z={z}`;
      
      if (sessionToken && apiKey) {
        tileUrl = `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${sessionToken}&key=${apiKey}`;
      }"""

new_logic = """      // Fallback URL if no API key or session fails
      let tileUrl = `https://mt1.google.com/vt/lyrs=${mapType === 'google-satellite' || mapType === 'google-hybrid' ? 's' : mapType === 'google-terrain' ? 'p' : 'm'}&x={x}&y={y}&z={z}`;
      let isOfficial = false;
      
      if (sessionToken && apiKey) {
        tileUrl = `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${sessionToken}&key=${apiKey}`;
        isOfficial = true;
      }
      
      console.info(
        `%c [Basemap] %c ${mapType} %c ${isOfficial ? '✅ RESMI (API Key)' : '⚠️ GRATISAN (Bypass)'}`,
        'background: #10b981; color: white; border-radius: 4px; padding: 2px;',
        'font-weight: bold;',
        isOfficial ? 'color: #10b981; font-weight: bold;' : 'color: #f59e0b; font-weight: bold;'
      );"""

content = content.replace(old_logic, new_logic)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'w') as f:
    f.write(content)
