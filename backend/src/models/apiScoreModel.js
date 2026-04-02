const pool = require('../config/db');

class ApiScoreModel {
    static async recalculateFacultyScore(faculty_id, academic_year) {
        // Step A: The Aggregation Query
        const sumQuery = `
            SELECT 
                COALESCE(SUM(assigned_score)::int, 0) as total_score,
                COALESCE(SUM(CASE WHEN category = 'Teaching' THEN assigned_score ELSE 0 END)::int, 0) as teaching_score,
                COALESCE(SUM(CASE WHEN category = 'Admin' THEN assigned_score ELSE 0 END)::int, 0) as admin_score,
                COALESCE(SUM(CASE WHEN category = 'Research' THEN assigned_score ELSE 0 END)::int, 0) as research_score
            FROM activities
            WHERE faculty_id = $1 
              AND status = 'Approved'
              AND TO_CHAR(date_of_activity, 'YYYY') = $2;
        `;
        const { rows: sumRows } = await pool.query(sumQuery, [faculty_id, academic_year]);
        const total_score = sumRows[0].total_score;
        const teaching_score = sumRows[0].teaching_score;
        const admin_score = sumRows[0].admin_score;
        const research_score = sumRows[0].research_score;

        // Apply Hard Caps
        const cap_teaching = Math.min(teaching_score, 100);
        const cap_research = Math.min(research_score, 150);
        const cap_admin = Math.min(admin_score, 50);

        // Normalize Scores
        const norm_teaching = (cap_teaching / 100) * 100;
        const norm_research = (cap_research / 150) * 100;
        const norm_admin = (cap_admin / 50) * 100;

        // Calculate Final API
        const final_api = (0.40 * norm_teaching) + (0.50 * norm_research) + (0.10 * norm_admin);

        // Step B: The "Upsert" Operation
        const upsertQuery = `
            INSERT INTO api_scores (faculty_id, academic_year, total_score, teaching_score, co_curricular_score, research_score, normalized_teaching, normalized_research, normalized_admin, final_api, last_recalculated)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
            ON CONFLICT (faculty_id, academic_year) 
            DO UPDATE SET 
                total_score = EXCLUDED.total_score, 
                teaching_score = EXCLUDED.teaching_score,
                co_curricular_score = EXCLUDED.co_curricular_score,
                research_score = EXCLUDED.research_score,
                normalized_teaching = EXCLUDED.normalized_teaching,
                normalized_research = EXCLUDED.normalized_research,
                normalized_admin = EXCLUDED.normalized_admin,
                final_api = EXCLUDED.final_api,
                last_recalculated = CURRENT_TIMESTAMP
            RETURNING *;
        `;
        const values = [
            faculty_id, academic_year, total_score, teaching_score, admin_score, research_score,
            norm_teaching, norm_research, norm_admin, final_api
        ];
        const upsertResult = await pool.query(upsertQuery, values);
        return upsertResult.rows[0];
    }

    static async getScoreSummary(faculty_id, academic_year) {
        const query = `
            SELECT * FROM api_scores 
            WHERE faculty_id = $1 AND academic_year = $2;
        `;
        const { rows } = await pool.query(query, [faculty_id, academic_year]);
        return rows[0];
    }
}

module.exports = ApiScoreModel;
