require('dotenv').config();
const pool = require('./src/config/db');

async function runMigration() {
    console.log("Starting Database Migration...");
    try {
        // 1. Drop significance
        console.log("Dropping 'significance' column from activities...");
        await pool.query(`ALTER TABLE activities DROP COLUMN IF EXISTS significance;`);

        // 2. Adjust file storage to BYTEA for Render compatibility
        console.log("Modifying file storage parameters in activities...");
        await pool.query(`ALTER TABLE activities DROP COLUMN IF EXISTS proof_document_path;`);
        await pool.query(`ALTER TABLE activities ADD COLUMN IF NOT EXISTS proof_document_file BYTEA;`);
        await pool.query(`ALTER TABLE activities ADD COLUMN IF NOT EXISTS proof_document_name VARCHAR(255);`);
        await pool.query(`ALTER TABLE activities ADD COLUMN IF NOT EXISTS proof_document_mime VARCHAR(100);`);

        // 3. Add API calculation columns
        console.log("Adding normalized metrics to api_scores...");
        await pool.query(`ALTER TABLE api_scores ADD COLUMN IF NOT EXISTS normalized_teaching FLOAT DEFAULT 0;`);
        await pool.query(`ALTER TABLE api_scores ADD COLUMN IF NOT EXISTS normalized_research FLOAT DEFAULT 0;`);
        await pool.query(`ALTER TABLE api_scores ADD COLUMN IF NOT EXISTS normalized_admin FLOAT DEFAULT 0;`);
        await pool.query(`ALTER TABLE api_scores ADD COLUMN IF NOT EXISTS final_api FLOAT DEFAULT 0;`);

        console.log("✅ Database Migration Completed Successfully!");
    } catch (err) {
        console.error("❌ Migration failed:", err);
    } finally {
        await pool.end();
    }
}

runMigration();
