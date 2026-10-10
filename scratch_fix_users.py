import re

with open('/home/wgipro/koding/newmap/my-app/app/users/page.tsx', 'r') as f:
    content = f.read()

replacement = """        if (u.role === 'desa' && u.kode_wilayah) {
            let kecCode = u.kode_wilayah;
            if (u.kode_wilayah.includes('.')) {
                const parts = u.kode_wilayah.split('.');
                if (parts.length >= 3) {
                    kecCode = parts.slice(0, 3).join(''); // e.g. 3575010 if it was 35.75.010
                }
            } else if (u.kode_wilayah.length >= 7) {
                kecCode = u.kode_wilayah.substring(0, 7);
            }
            setSelectedKecamatan(kecCode);
            await fetchDesaList(kecCode);
        } else {"""

content = re.sub(
    r"        if \(u\.role === 'desa' && u\.kode_wilayah\) \{\n            const parts = u\.kode_wilayah\.split\('\.'\);\n            if \(parts\.length >= 3\) \{\n                const kecCode = parts\[2\];\n                setSelectedKecamatan\(kecCode\);\n                await fetchDesaList\(kecCode\);\n            \}\n        \} else \{",
    replacement,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/app/users/page.tsx', 'w') as f:
    f.write(content)
