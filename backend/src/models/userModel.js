const pool = require('../config/db');

class UserModel {
    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await pool.query(query, [email]);
        return rows[0];
    }

    static async findAll() {
        const query = 'SELECT id, first_name, last_name, email, role, department_id, designation, qualification, is_active, is_verified, created_at FROM users ORDER BY first_name ASC';
        const { rows } = await pool.query(query);
        return rows;
    }

    static async findById(id) {
        const query = 'SELECT id, first_name, last_name, email, role, department_id, designation, qualification, is_active FROM users WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    static async create(userData) {
        const { department_id, designation, qualification, first_name, last_name, email, password_hash, role, otp, otp_expires_at } = userData;
        const query = `
            INSERT INTO users (department_id, designation, qualification, first_name, last_name, email, password_hash, role, otp, otp_expires_at, is_verified)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false)
            RETURNING id, first_name, last_name, email, role, department_id, designation, qualification, is_verified;
        `;
        const values = [department_id, designation || null, qualification || null, first_name, last_name, email, password_hash, role, otp, otp_expires_at];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async updateOTP(userId, otp, expiresAt) {
        const query = `UPDATE users SET otp = $1, otp_expires_at = $2 WHERE id = $3 RETURNING *`;
        const { rows } = await pool.query(query, [otp, expiresAt, userId]);
        return rows[0];
    }

    static async verifyUser(userId) {
        const query = `UPDATE users SET is_verified = true, otp = NULL, otp_expires_at = NULL WHERE id = $1 RETURNING *`;
        const { rows } = await pool.query(query, [userId]);
        return rows[0];
    }
}

module.exports = UserModel;
