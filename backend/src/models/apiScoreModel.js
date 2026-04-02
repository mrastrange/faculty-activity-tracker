const pool = require('../config/db');

class ApiScoreModel {
    static async recalculateFacultyScore(faculty_id, academic_year) {
        // Step A: The Aggregation Query
        const sumQuery = `
            SELECT 
                COALESCE(SUM(assigned_score)::int, 0) as total_score,
                COALESCE(SUM(CASE WHEN category = 'Teaching' THEN assigned_score ELSE 0 END)::int, 0) as teaching_score,
                COALESCE(SUM(CASE WHEN category = 'Co-curricular' THEN assigned_score ELSE 0 END)::int, 0) as co_curricular_score,
                COALESCE(SUM(CASE WHEN category = 'Research' THEN assigned_score ELSE 0 END)::int, 0) as research_score
            FROM activities
            WHERE faculty_id = $1 
              AND status = 'Approved'
              AND TO_CHAR(date_of_activity, 'YYYY') = $2;
        `;
        const { rows: sumRows } = await pool.query(sumQuery, [faculty_id, academic_year]);
        const total_score = sumRows[0].total_score;
        const teaching_score = sumRows[0].teaching_score;
        const co_curricular_score = sumRows[0].co_curricular_score;
        const research_score = sumRows[0].research_score;

        // Step B: The "Upsert" Operation
        const upsertQuery = `
            INSERT INTO api_scores (faculty_id, academic_year, total_score, teaching_score, co_curricular_score, research_score, last_recalculated)
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
            ON CONFLICT (faculty_id, academic_year) 
            DO UPDATE SET 
                total_score = EXCLUDED.total_score, 
                teaching_score = EXCLUDED.teaching_score,
                co_curricular_score = EXCLUDED.co_curricular_score,
                research_score = EXCLUDED.research_score,
                last_recalculated = CURRENT_TIMESTAMP
            RETURNING *;
        `;
        const upsertResult = await pool.query(upsertQuery, [faculty_id, academic_year, total_score, teaching_score, co_curricular_score, research_score]);
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
