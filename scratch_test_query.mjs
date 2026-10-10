import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '/home/wgipro/koding/newmap/my-app/.env.local' });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Simple test: check if nops table has data and what SRID
try {
    const r1 = await pool.query("SELECT count(*) as cnt FROM nops");
    console.log("Total nops:", r1.rows[0].cnt);
    
    const r2 = await pool.query("SELECT ST_SRID(geom) as srid, ST_GeometryType(geom) as gtype FROM nops LIMIT 1");
    console.log("SRID:", r2.rows[0]?.srid, "Type:", r2.rows[0]?.gtype);

    const r3 = await pool.query("SELECT d_kd_kel, count(*) as cnt FROM nops GROUP BY d_kd_kel ORDER BY cnt DESC LIMIT 5");
    console.log("Top desa codes:", r3.rows);
    
    // Test a simple spatial query with a bbox covering Pasuruan city
    const testGeom = {
        type: "Polygon",
        coordinates: [[[112.88, -7.66], [112.92, -7.66], [112.92, -7.62], [112.88, -7.62], [112.88, -7.66]]]
    };
    
    const r4 = await pool.query(
        `SELECT count(*) as cnt FROM nops 
         WHERE ST_Intersects(ST_SetSRID(geom, 4326), ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)))`,
        [JSON.stringify(testGeom)]
    );
    console.log("Spatial query result (test bbox):", r4.rows[0].cnt);
    
} catch (err) {
    console.error("ERROR:", err.message);
} finally {
    await pool.end();
}
