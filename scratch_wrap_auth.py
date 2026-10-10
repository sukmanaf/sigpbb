import re

with open('/home/wgipro/koding/newmap/my-app/app/layout.tsx', 'r') as f:
    content = f.read()

# Add import
if 'AuthProvider' not in content:
    content = content.replace("import type { Metadata } from 'next';", "import type { Metadata } from 'next';\nimport { AuthProvider } from '@/contexts/AuthContext';")

# Wrap children
content = re.sub(
    r"<body className=\{`\$\{geistSans\.variable\} \$\{geistMono\.variable\} antialiased`\}>\n\s*(.*?)\n\s*</body>",
    r"<body className={`\\${geistSans.variable} \\${geistMono.variable} antialiased`}>\n        <AuthProvider>\n          \1\n        </AuthProvider>\n      </body>",
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/app/layout.tsx', 'w') as f:
    f.write(content)
