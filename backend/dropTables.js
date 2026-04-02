const { pool } = require('./src/config/db');

async function dropTables() {
    try {
        console.log("Dropping old tables...");
        await pool.query('DROP TABLE IF EXISTS api_scores CASCADE');
        await pool.query('DROP TABLE IF EXISTS faculty_activities CASCADE');
        await pool.query('DROP TABLE IF EXISTS activities CASCADE');
        await pool.query('DROP TABLE IF EXISTS narratives CASCADE');
        await pool.query('DROP TABLE IF EXISTS activity_categories CASCADE');
        await pool.query('DROP TABLE IF EXISTS users CASCADE');
        await pool.query('DROP TABLE IF EXISTS departments CASCADE');

        await pool.query('DROP TYPE IF EXISTS activity_category CASCADE');
        await pool.query('DROP TYPE IF EXISTS significance_level CASCADE');
        console.log("Tables dropped.");
    } catch (e) { console.error(e) } finally { pool.end() }
}
dropTables();
