const pool = require('../config/db');

class ActivityModel {
    static async create(activityData) {
        const { faculty_id, category, significance, semester, title, description, date_of_activity, proof_document_path, quantity, suggested_score } = activityData;
        const query = `
            INSERT INTO activities (faculty_id, category, significance, semester, title, description, date_of_activity, proof_document_path, quantity, suggested_score)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `;
        const values = [faculty_id, category, significance, semester, title, description, date_of_activity, proof_document_path, quantity || 1, suggested_score || 0];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async getByFaculty(faculty_id) {
        const query = `
            SELECT a.* 
            FROM activities a
            WHERE a.faculty_id = $1
            ORDER BY a.submitted_at DESC;
        `;
        const { rows } = await pool.query(query, [faculty_id]);
        return rows;
    }

    static async getByDepartment(department_id) {
        const query = `
            SELECT a.*, u.first_name, u.last_name
            FROM activities a
            JOIN users u ON a.faculty_id = u.id
            WHERE u.department_id = $1
            ORDER BY a.submitted_at DESC;
        `;
        const { rows } = await pool.query(query, [department_id]);
        return rows;
    }

    static async getAll() {
        const query = `
            SELECT a.*, u.first_name, u.last_name, u.department_id
            FROM activities a
            JOIN users u ON a.faculty_id = u.id
            ORDER BY a.submitted_at DESC;
        `;
        const { rows } = await pool.query(query);
        return rows;
    }

    static async updateStatus(activity_id, reviewer_id, review_comments, status, assigned_score) {
        const query = `
            UPDATE activities 
            SET status = $1, reviewer_id = $2, reviewer_comments = $3, assigned_score = $4, updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING *;
        `;
        const values = [status, reviewer_id, review_comments, assigned_score, activity_id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }
}

module.exports = ActivityModel;
