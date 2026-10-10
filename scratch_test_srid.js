const { Pool } = require('pg');
require('dotenv').config({path: '/home/wgipro/koding/newmap/my-app/.env.local'});
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT ST_SRID(geom) FROM nops LIMIT 1").then(res => {
  console.log(res.rows);
  pool.end();
}).catch(console.error);
