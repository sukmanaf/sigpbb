import re

with open('/home/wgipro/koding/newmap/my-app/components/map/Legend.tsx', 'r') as f:
    content = f.read()

# Add a dictionary mapping
mapping = """const TEMATIK_LABELS: Record<string, string> = {
  'jenis_tanah': 'Jenis Tanah',
  'kelas_tanah': 'Kelas Tanah',
  'jenis_bangunan': 'Jenis Bangunan',
  'kelas_bangunan': 'Kelas Bangunan',
  'nilai_individu': 'Nilai Individu',
  'nik': 'Status NIK',
  'zona_nilai_tanah': 'ZNT',
  'ketetapan_per_buku': 'Ketetapan per Buku',
  'status_pembayaran': 'Status Pembayaran'
};

export function Legend() {"""

content = content.replace("export function Legend() {", mapping)

# Change the title
old_title = """        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
          Legenda Tematik
        </h4>"""

new_title = """        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
          Legenda {TEMATIK_LABELS[ctx.activeTematik!] || 'Tematik'}
        </h4>"""

content = content.replace(old_title, new_title)

with open('/home/wgipro/koding/newmap/my-app/components/map/Legend.tsx', 'w') as f:
    f.write(content)
