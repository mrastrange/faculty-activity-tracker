const pool = require('./src/config/db');

async function migrateApiScores() {
    try {
        console.log("Starting database migration for API Scores...");

        // Alter api_scores table to hold individual category scores
        await pool.query(`
            ALTER TABLE api_scores 
            ADD COLUMN IF NOT EXISTS teaching_score INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS co_curricular_score INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS research_score INT DEFAULT 0;
        `);
        console.log("api_scores table altered successfully.");

        // Alter activities table to support a quantity multiplier
        await pool.query(`
            ALTER TABLE activities
            ADD COLUMN IF NOT EXISTS quantity INT DEFAULT 1;
        `);
        console.log("activities table altered successfully.");

        console.log("Migration completed successfully.");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        pool.end();
    }
}

migrateApiScores();
