const pool = require('./src/config/db');
async function runUpdate() {
    try {
        await pool.query("UPDATE users SET password_hash = 'password123'");
        console.log("Successfully updated all users to use plain text 'password123'");
    } catch (e) {
        console.error("Failed to update passwords:", e);
    } finally {
        pool.end();
    }
}
runUpdate();
