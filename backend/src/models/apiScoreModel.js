const pool = require('../config/db');

const CATEGORY_CAPS = {
    teaching: 100,
    coCurricular: 30,
    research: 100
};

class ApiScoreModel {
    static async recalculateFacultyScore(faculty_id, academic_year) {
        const sumQuery = `
            SELECT 
                COALESCE(SUM(CASE WHEN category = 'Teaching' THEN assigned_score ELSE 0 END)::int, 0) as teaching_score,
                COALESCE(SUM(CASE WHEN category IN ('Co-curricular', 'Service') THEN assigned_score ELSE 0 END)::int, 0) as co_curricular_score,
                COALESCE(SUM(CASE WHEN category = 'Research' THEN assigned_score ELSE 0 END)::int, 0) as research_score
            FROM activities
            WHERE faculty_id = $1 
              AND status = 'Approved'
              AND TO_CHAR(date_of_activity, 'YYYY') = $2;
        `;
        const { rows: sumRows } = await pool.query(sumQuery, [faculty_id, academic_year]);
        const rawTeachingScore = parseInt(sumRows[0].teaching_score, 10) || 0;
        const rawCoCurricularScore = parseInt(sumRows[0].co_curricular_score, 10) || 0;
        const rawResearchScore = parseInt(sumRows[0].research_score, 10) || 0;

        const teaching_score = Math.min(rawTeachingScore, CATEGORY_CAPS.teaching);
        const co_curricular_score = Math.min(rawCoCurricularScore, CATEGORY_CAPS.coCurricular);
        const research_score = Math.min(rawResearchScore, CATEGORY_CAPS.research);
        const total_score = teaching_score + co_curricular_score + research_score;

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

    static async recalculateAllScoresForYear(academic_year) {
        const facultyQuery = `
            SELECT DISTINCT faculty_id
            FROM activities
            WHERE TO_CHAR(date_of_activity, 'YYYY') = $1;
        `;
        const { rows } = await pool.query(facultyQuery, [academic_year]);

        for (const row of rows) {
            await this.recalculateFacultyScore(row.faculty_id, academic_year);
        }
    }
}

module.exports = ApiScoreModel;
