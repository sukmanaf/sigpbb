const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'maps',
    user: 'postgres',
    password: '123123',
});

async function main() {
    try {
        const { rows } = await pool.query("SELECT * FROM users WHERE username = 'bapenda'");
        console.log(rows);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
main();
