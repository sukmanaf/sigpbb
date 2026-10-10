const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '123123',
  database: 'maps'
});

async function run() {
  try {
    const res1 = await pool.query("SELECT COUNT(*) FROM bloks");
    console.log("Bloks count:", res1.rows[0].count);
    const res2 = await pool.query("SELECT COUNT(*) FROM bangunans");
    console.log("Bangunans count:", res2.rows[0].count);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
