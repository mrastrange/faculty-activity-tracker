const pool = require('./db');

async function ensureRuntimeSchema() {
    await pool.query(`
        DO $$
        BEGIN
            BEGIN
                ALTER TYPE activity_category ADD VALUE IF NOT EXISTS 'Co-curricular';
            EXCEPTION
                WHEN undefined_object THEN NULL;
            END;
        END $$;
    `);

    await pool.query(`
        ALTER TABLE IF EXISTS activities
        ADD COLUMN IF NOT EXISTS quantity INT DEFAULT 1;
    `);

    await pool.query(`
        ALTER TABLE IF EXISTS activities
        ADD COLUMN IF NOT EXISTS suggested_score DECIMAL(7, 2) DEFAULT 0;
    `);

    await pool.query(`
        ALTER TABLE IF EXISTS api_scores
        ADD COLUMN IF NOT EXISTS teaching_score DECIMAL(7, 2) DEFAULT 0;
    `);

    await pool.query(`
        ALTER TABLE IF EXISTS api_scores
        ADD COLUMN IF NOT EXISTS co_curricular_score DECIMAL(7, 2) DEFAULT 0;
    `);

    await pool.query(`
        ALTER TABLE IF EXISTS api_scores
        ADD COLUMN IF NOT EXISTS research_score DECIMAL(7, 2) DEFAULT 0;
    `);
}

module.exports = ensureRuntimeSchema;
