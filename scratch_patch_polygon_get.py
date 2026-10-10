import re

with open('/home/wgipro/koding/newmap/my-app/app/api/polygon-get/route.ts', 'r') as f:
    content = f.read()

old_table = """        let table = 'nops';
        let codeCol = 'd_nop';
        if (type === 'blok') { table = 'bloks'; codeCol = 'd_blok'; }
        else if (type === 'bangunan') { table = 'bangunans'; codeCol = 'd_nop'; }"""

new_table = """        let table = 'nops';
        let codeCol = 'd_nop';
        if (type === 'blok') { table = 'bloks'; codeCol = 'd_blok'; }
        else if (type === 'bangunan') { table = 'bangunans'; codeCol = 'd_nop'; }
        else if (type === 'desa') { table = 'desas'; codeCol = 'd_kd_kel'; }"""

content = content.replace(old_table, new_table)

with open('/home/wgipro/koding/newmap/my-app/app/api/polygon-get/route.ts', 'w') as f:
    f.write(content)
