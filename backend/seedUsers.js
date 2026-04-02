const { pool } = require('./src/config/db');

async function seed() {
    try {
        await pool.query("INSERT INTO departments (id, name) VALUES (1, 'Computer Science') ON CONFLICT (id) DO NOTHING");

        await pool.query(`INSERT INTO users (id, first_name, last_name, email, password_hash, role, department_id, is_active, is_verified) 
                          VALUES (1, 'Super', 'Admin', 'admin@college.edu', 'password123', 'Admin', 1, true, true) 
                          ON CONFLICT (email) DO UPDATE SET password_hash = 'password123', role='Admin', is_active=true, is_verified=true;`);

        await pool.query(`INSERT INTO users (id, first_name, last_name, email, password_hash, role, department_id, is_active, is_verified) 
                          VALUES (2, 'HOD', 'CS', 'hod@college.edu', 'password123', 'HOD', 1, true, true) 
                          ON CONFLICT (email) DO UPDATE SET password_hash = 'password123', role='HOD', is_active=true, is_verified=true;`);

        await pool.query("UPDATE users SET password_hash = 'password123', department_id = 1 WHERE id = 9");

        console.log('Successfully seeded Admin and HOD accounts!');
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
seed();
