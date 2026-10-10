import re

with open('/home/wgipro/koding/newmap/my-app/components/map/TematikController.tsx', 'r') as f:
    content = f.read()

old_logic = """        if (!json.success) return;
        
        const data = json.data;
        setTematikData(data);"""

new_logic = """        if (!json.success) return;
        
        let data = json.data;
        
        // Regroup ZNT by NIR instead of KD_ZNT
        if (activeTematik === 'zona_nilai_tanah') {
            const groupedByNir: Record<string, any[]> = {};
            Object.values(data).forEach((items: any) => {
                items.forEach((item: any) => {
                    const nir = item.NIR || 'Tidak Diketahui';
                    if (!groupedByNir[nir]) groupedByNir[nir] = [];
                    groupedByNir[nir].push(item);
                });
            });
            data = groupedByNir;
        }

        setTematikData(data);"""

content = content.replace(old_logic, new_logic)

with open('/home/wgipro/koding/newmap/my-app/components/map/TematikController.tsx', 'w') as f:
    f.write(content)
