const pool = require('./backend/src/config/db');

async function verifyDB() {
    try {
        console.log("--- Checking 'activities' table schema ---");
        const { rows: activitiesSchema } = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'activities';
        `);
        console.table(activitiesSchema);

        console.log("\n--- Checking 'api_scores' table schema ---");
        const { rows: apiScoresSchema } = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'api_scores';
        `);
        console.table(apiScoresSchema);

        console.log("\n--- Validating Data Accuracy ---");
        const { rows: activityTotals } = await pool.query(`
            SELECT 
                faculty_id, 
                TO_CHAR(date_of_activity, 'YYYY') as year,
                SUM(assigned_score) as sum_assigned_score
            FROM activities
            WHERE status = 'Approved'
            GROUP BY faculty_id, year;
        `);
        console.log("Calculated Totals from Activities:");
        console.table(activityTotals);

        const { rows: scoreTotals } = await pool.query(`
            SELECT faculty_id, academic_year, total_score 
            FROM api_scores;
        `);
        console.log("Stored Totals in api_scores:");
        console.table(scoreTotals);

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

verifyDB();
