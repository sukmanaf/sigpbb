import re

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'r') as f:
    content = f.read()

old_items = """const tematikItems = [
  { id: 'jenis_tanah', name: 'Jenis Tanah' },
  { id: 'kelas_tanah', name: 'Kelas Tanah' },
  { id: 'jenis_bangunan', name: 'Jenis Bangunan' },
  { id: 'kelas_bangunan', name: 'Kelas Bangunan' },
  { id: 'nilai_individu', name: 'Nilai Objek' },
  { id: 'nik', name: 'NIK' },
  { id: 'zona_nilai_tanah', name: 'Umur Bangunan' },
  { id: 'ketetapan_per_buku', name: 'Ketetapan per Desa' },
  { id: 'status_pembayaran', name: 'Status Pembayaran' },
];"""

new_items = """const tematikItems = [
  { id: 'jenis_tanah', name: 'Jenis Tanah' },
  { id: 'kelas_tanah', name: 'Kelas Tanah' },
  { id: 'jenis_bangunan', name: 'Jenis Bangunan' },
  { id: 'kelas_bangunan', name: 'Kelas Bangunan' },
  { id: 'nilai_individu', name: 'Nilai Individu' },
  { id: 'nik', name: 'Status NIK' },
  { id: 'zona_nilai_tanah', name: 'Zona Nilai Tanah (ZNT)' },
  { id: 'ketetapan_per_buku', name: 'Ketetapan per Buku' },
  { id: 'status_pembayaran', name: 'Status Pembayaran' },
];"""

content = content.replace(old_items, new_items)

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'w') as f:
    f.write(content)
