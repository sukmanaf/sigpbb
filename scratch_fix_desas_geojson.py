import re

with open('/home/wgipro/koding/newmap/my-app/app/api/desas/route.ts', 'r') as f:
    content = f.read()

replacement = """import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getSession } from '@/lib/auth';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123123',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'maps',
});

export async function GET() {
  try {
    const user = await getSession();
    
    let whereClause = "";
    const params = [];
    
    if (user) {
        if (user.role === 'desa' && user.kode_wilayah) {
            whereClause = "WHERE d_kd_kel = $1";
            params.push(user.kode_wilayah);
        } else if (user.role === 'kecamatan' && user.kode_wilayah) {
            whereClause = "WHERE d_kd_kel LIKE $1";
            // Get first 7 characters for kecamatan
            let kecCode = user.kode_wilayah;
            if (kecCode.includes('.')) {
                kecCode = kecCode.split('.').slice(0,3).join('');
            } else if (kecCode.length >= 7) {
                kecCode = kecCode.substring(0, 7);
            }
            params.push(`${kecCode}%`);
        }
    }

    const query = `
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(json_agg(ST_AsGeoJSON(t.*)::json), '[]'::json)
      ) as geojson
      FROM (
        SELECT d_kd_kel, d_nm_kel, geom 
        FROM desas
        ${whereClause}
      ) as t;
    `;
    const { rows } = await pool.query(query, params);"""

content = re.sub(
    r"import \{ NextResponse \} from 'next/server';\nimport \{ Pool \} from 'pg';\n\nconst pool = new Pool\(\{\n  user: process\.env\.DB_USER \|\| 'postgres',\n  password: process\.env\.DB_PASSWORD \|\| '123123',\n  host: process\.env\.DB_HOST \|\| 'localhost',\n  port: parseInt\(process\.env\.DB_PORT \|\| '5432'\),\n  database: process\.env\.DB_NAME \|\| 'maps',\n\}\);\n\nexport async function GET\(\) \{\n  try \{\n    const query = `\n      SELECT json_build_object\(\n        'type', 'FeatureCollection',\n        'features', json_agg\(ST_AsGeoJSON\(t\.\*\)::json\)\n      \) as geojson\n      FROM \(\n        SELECT d_kd_kel, d_nm_kel, geom \n        FROM desas\n      \) as t;\n    `;\n    const \{ rows \} = await pool\.query\(query\);",
    replacement,
    content,
    flags=re.DOTALL
)

with open('/home/wgipro/koding/newmap/my-app/app/api/desas/route.ts', 'w') as f:
    f.write(content)
