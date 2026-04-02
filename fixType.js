const pool = require('./backend/src/config/db').pool;
async function go() {
    try {
        await pool.query("ALTER TYPE activity_category ADD VALUE IF NOT EXISTS 'Co-curricular'");
        console.log("Success");
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
go();
