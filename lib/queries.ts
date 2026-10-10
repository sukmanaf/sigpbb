import { pool } from './db';

export async function getNopDetail(nop: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT
        n.id, n.d_nop, n.d_luas,
        d.d_kd_kel, d.d_nm_kel,
        b.d_blok,
        json_agg(
          json_build_object(
            'id', bu.id,
            'geom', ST_AsGeoJSON(bu.geom)
          )
        ) FILTER (WHERE bu.id IS NOT NULL) as bangunan
      FROM nops n
      LEFT JOIN desas d ON ST_Contains(d.geom, ST_Centroid(n.geom))
      LEFT JOIN bloks b ON ST_Contains(b.geom, ST_Centroid(n.geom))
      LEFT JOIN bangunans bu ON bu.d_nop = n.d_nop
      WHERE n.d_nop = $1
      GROUP BY n.id, n.d_nop, n.d_luas, d.d_kd_kel, d.d_nm_kel, b.d_blok
    `, [nop]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function getDesaStats(desaId: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT
        d.id, d.d_kd_kel, d.d_nm_kel,
        COUNT(n.id) as total_nop,
        SUM(n.d_luas) as total_luas,
        COUNT(bu.id) as total_bangunan
      FROM desas d
      LEFT JOIN nops n ON ST_Contains(d.geom, ST_Centroid(n.geom))
      LEFT JOIN bangunans bu ON bu.d_nop = n.d_nop
      WHERE d.d_kd_kel = $1
      GROUP BY d.id, d.d_kd_kel, d.d_nm_kel
    `, [desaId]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function searchGlobal(query: string) {
  const client = await pool.connect();
  try {
    const [nopResults, desaResults] = await Promise.all([
      client.query(`
        SELECT 'nop' as type, d_nop as id, d_nop as label, d_luas::text as sublabel
        FROM nops WHERE d_nop ILIKE $1 LIMIT 5
      `, [`%${query}%`]),
      client.query(`
        SELECT 'desa' as type, d_kd_kel as id, d_nm_kel as label, d_kd_kel as sublabel
        FROM desas WHERE d_nm_kel ILIKE $1 OR d_kd_kel ILIKE $1 LIMIT 5
      `, [`%${query}%`]),
    ]);
    return [...nopResults.rows, ...desaResults.rows];
  } finally {
    client.release();
  }
}

export async function generateNop(desaCode: string): Promise<string> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT COALESCE(MAX(CAST(SUBSTRING(d_nop FROM '\\d+$') AS INTEGER)), 0) + 1 as next_num
      FROM nops
      WHERE d_nop LIKE $1
    `, [`${desaCode}%`]);
    const nextNum = String(result.rows[0].next_num).padStart(4, '0');
    return `${desaCode}${nextNum}`;
  } finally {
    client.release();
  }
}

export async function calculateArea(geometry: object): Promise<number> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT ST_Area(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)::geography) as area
    `, [JSON.stringify(geometry)]);
    return result.rows[0]?.area || 0;
  } finally {
    client.release();
  }
}
