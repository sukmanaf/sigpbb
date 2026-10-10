import re

with open('/home/wgipro/koding/newmap/my-app/components/map/TematikController.tsx', 'r') as f:
    content = f.read()

replacement = """    const requiresYear = ['kelas_tanah', 'kelas_bangunan', 'zona_nilai_tanah', 'status_pembayaran', 'ketetapan_per_buku'];

    async function fetchTematik() {
      let selectedYear: string | undefined;
      
      if (requiresYear.includes(activeTematik!)) {
        const currentYear = new Date().getFullYear();
        const years: Record<string, string> = {};
        for (let y = currentYear; y >= 1990; y--) {
            years[y] = y.toString();
        }
        
        const { value: year, isDismissed } = await Swal.fire({
          title: 'Pilih Tahun Pajak',
          input: 'select',
          inputOptions: years,
          inputValue: currentYear,
          showCancelButton: true,
          confirmButtonText: 'Tampilkan',
          cancelButtonText: 'Batal',
          confirmButtonColor: '#059669',
        });

        if (isDismissed || !year) {
           ctx?.setActiveTematik(null);
           return;
        }
        selectedYear = year;
      }

      setTematikLoading(true);
      try {
        const res = await fetch(`/api/tematik/${activeTematik}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ desaKode: selectedDesa, tahun: selectedYear })
        });"""

content = re.sub(
    r"    async function fetchTematik\(\) \{\n      setTematikLoading\(true\);\n      try \{\n        const res = await fetch\(`/api/tematik/\$\{activeTematik\}`.*?body: JSON\.stringify\(\{ desaKode: selectedDesa \}\)\n        \}\);",
    replacement,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/components/map/TematikController.tsx', 'w') as f:
    f.write(content)
