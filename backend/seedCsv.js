const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { pool } = require('./src/config/db');

async function seedFaculty() {
    console.log('Starting Faculty CSV Import...');

    try {
        // Read and parse the CSV
        // name,designation,qualification,department,email
        const csvFilePath = path.join(__dirname, '../faculty.csv');
        const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        });

        console.log(`Found ${records.length} records in CSV.`);

        // Ensure the IT department exists
        let deptId = null;
        const deptRes = await pool.query(`INSERT INTO departments (name) VALUES ('Department of Information Technology') ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id`);
        if (deptRes.rows.length > 0) {
            deptId = deptRes.rows[0].id;
        } else {
            const getDept = await pool.query(`SELECT id FROM departments WHERE name = 'Department of Information Technology'`);
            deptId = getDept.rows[0].id;
        }

        // Insert faculty
        let inserted = 0;
        let skipped = 0;

        for (const row of records) {
            // Split name into first and last
            let parts = row.name.trim().split(' ');
            let first_name = parts[0];
            let last_name = parts.slice(1).join(' ') || ' '; // Ensure last_name is not empty

            // Handle titles like Dr.
            if (first_name === 'Dr.' || first_name === 'Mr.') {
                first_name += ' ' + (parts[1] || '');
                last_name = parts.slice(2).join(' ') || ' ';
            }

            // Determine role. If designation is Admin, make them Admin. Otherwise Faculty.
            // HOD can be determined by designation.
            let role = 'Faculty';
            if (row.designation.toLowerCase().includes('head')) role = 'HOD';
            if (row.designation.toLowerCase().includes('admin')) role = 'Admin';

            // Check if user already exists
            const existing = await pool.query('SELECT id FROM users WHERE email = $1', [row.email.trim()]);

            if (existing.rows.length === 0) {
                await pool.query(`
                    INSERT INTO users (department_id, first_name, last_name, email, password_hash, role, designation, qualification)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, [
                    deptId,
                    first_name,
                    last_name,
                    row.email.trim(),
                    null, // Null password for OTP flow
                    role,
                    row.designation.trim(),
                    row.qualification.trim()
                ]);
                inserted++;
            } else {
                skipped++;
            }
        }

        console.log(`Import Complete! Inserted: ${inserted}, Skipped (Already exists): ${skipped}`);

        // Also ensure seed Admin exists explicitly just in case CSV didn't have one we want
        await pool.query(`
            INSERT INTO users (first_name, last_name, email, password_hash, role)
            VALUES ('Super', 'Admin', 'admin@college.edu', 'password123', 'Admin')
            ON CONFLICT (email) DO NOTHING
        `);

    } catch (err) {
        console.error('Error seeding faculty:', err);
    } finally {
        pool.end();
    }
}

seedFaculty();
