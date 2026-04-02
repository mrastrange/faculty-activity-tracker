const pool = require('./backend/src/config/db');

async function testQuery() {
    try {
        const { rows } = await pool.query("SELECT id, faculty_id, title, category, status, assigned_score, suggested_score, date_of_activity, TO_CHAR(date_of_activity, 'YYYY') as year FROM activities;");
        console.log("Activities data:");
        console.table(rows);

        const { rows: scoreRows } = await pool.query("SELECT * FROM api_scores;");
        console.log("API Scores data:");
        console.table(scoreRows);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

testQuery();
