const pool = require('./src/config/db');
async function fixDb() {
    try {
        await pool.query("INSERT INTO departments (id, name) VALUES (1, 'Computer Science') ON CONFLICT (id) DO NOTHING");
        await pool.query("UPDATE users SET department_id = 1 WHERE department_id IS NULL");
        console.log('Database updated: Seeded CS department & assigned existing users to it.');
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
fixDb();
