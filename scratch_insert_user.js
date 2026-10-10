const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'maps',
    user: 'postgres',
    password: '123123',
});

async function main() {
    try {
        const hashedPassword = await bcrypt.hash('Admin!!@#$', 10);
        
        // Cek apakah tabel users ada
        const { rows: tableCheck } = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            );
        `);
        
        if (!tableCheck[0].exists) {
            console.log("Tabel users belum ada. Membuat tabel...");
            await pool.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(100) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    role VARCHAR(50) NOT NULL,
                    kode_wilayah VARCHAR(20),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
        }

        // Upsert user admin
        const query = `
            INSERT INTO users (username, password, name, role) 
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (username) 
            DO UPDATE SET password = EXCLUDED.password
            RETURNING id;
        `;
        const result = await pool.query(query, ['admin', hashedPassword, 'Administrator', 'admin']);
        console.log("User admin created/updated with ID:", result.rows[0].id);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pool.end();
    }
}
main();
