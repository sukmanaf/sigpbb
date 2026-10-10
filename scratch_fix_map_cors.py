import re

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'r') as f:
    content = f.read()

replacement = """        transformRequest: (url: string) => {
          if (url.startsWith('/')) {
            return { url: `${window.location.origin}${url}` };
          }
          // Bust poisoned CORS cache from localhost:5173 (old Vite app)
          if (url.startsWith('http') && !url.includes('cb=1')) {
            const sep = url.includes('?') ? '&' : '?';
            return { url: `${url}${sep}cb=1` };
          }
          return { url };
        },"""

content = re.sub(
    r"        transformRequest: \(url: string\) => \{\n          if \(url\.startsWith\('/'\)\) \{\n            return \{ url: `\$\{window\.location\.origin\}\$\{url\}` \};\n          \}\n          return \{ url \};\n        \},",
    replacement,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/components/map/MapView.tsx', 'w') as f:
    f.write(content)
