import re

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'r') as f:
    content = f.read()

tematik_list = """const tematikItems = [
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

content = re.sub(r"const tematikItems = \[.*?\];", tematik_list, content, flags=re.DOTALL)

button_replacement = """                    {tematikItems.map((item) => (
                      <button 
                        key={item.id} 
                        onClick={() => {
                          if (ctx?.activeTematik === item.id) {
                            ctx?.setActiveTematik(null);
                          } else {
                            ctx?.setActiveTematik(item.id);
                          }
                          setTematikOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          ctx?.activeTematik === item.id 
                            ? 'bg-emerald-100 text-emerald-700 font-semibold' 
                            : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}"""

content = re.sub(r"                    \{tematikItems\.map\(\(item\) => \(.*?\)\)\}?", button_replacement, content, flags=re.DOTALL)

with open('/home/wgipro/koding/newmap/my-app/components/ui/TopNavbar.tsx', 'w') as f:
    f.write(content)
