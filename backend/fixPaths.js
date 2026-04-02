const { pool } = require('./src/config/db');

async function fix() {
    try {
        const { rows } = await pool.query("SELECT id, proof_document_path FROM activities");
        for (let row of rows) {
            if (row.proof_document_path && row.proof_document_path.includes('uploads')) {
                let parts = row.proof_document_path.split('uploads');
                let newPath = 'uploads' + parts[1];
                // Remove leading slashes after uploads if any
                newPath = newPath.replace(/\\/g, '/');
                await pool.query("UPDATE activities SET proof_document_path = $1 WHERE id = $2", [newPath, row.id]);
            }
        }
        console.log("Fixed paths!");
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
fix();
