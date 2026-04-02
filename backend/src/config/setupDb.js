const fs = require('fs');
const path = require('path');
const { pool } = require('./db');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
    console.log('Connecting to database...');
    try {
        // 1. Departments Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('Departments table checked.');

        // 2. Users Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          department_id INT REFERENCES departments(id) ON DELETE SET NULL,
          designation VARCHAR(150),
          qualification VARCHAR(255),
          first_name VARCHAR(50) NOT NULL,
          last_name VARCHAR(50) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255), -- Nullable for new OTP flow
          role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'HOD', 'Faculty')),
          is_active BOOLEAN DEFAULT true,
          is_verified BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          otp VARCHAR(10),
          otp_expires_at TIMESTAMP
      );
    `);
        console.log('Users table checked.');

        // Add indexes (If Not Exists)
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_role_dept ON users(role, department_id);`);

        // 3. Activity Categories (Replaced with Enums for CAMD Style)
        await pool.query(`
            DO $$ BEGIN
                CREATE TYPE activity_category AS ENUM ('Teaching', 'Research', 'Service');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await pool.query(`
            DO $$ BEGIN
                CREATE TYPE significance_level AS ENUM ('Major', 'Significant', 'Minor');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // 4. Activities Table (Updated for CAMD Style)
        await pool.query(`
      CREATE TABLE IF NOT EXISTS activities (
          id SERIAL PRIMARY KEY,
          faculty_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          category activity_category NOT NULL,
          significance significance_level NOT NULL,
          semester VARCHAR(255), -- Comma separated Fall 2026, Spring 2026 etc.
          title VARCHAR(255) NOT NULL,
          description TEXT,
          date_of_activity DATE NOT NULL,
          proof_document_path VARCHAR(255), -- Made optional for now based on UI
          quantity INT DEFAULT 1,
          suggested_score DECIMAL(7, 2) DEFAULT 0,
          status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
          assigned_score DECIMAL(7, 2),
          reviewer_id INT REFERENCES users(id) ON DELETE SET NULL,
          reviewer_comments TEXT,
          submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('Activities table checked.');

        await pool.query(`CREATE INDEX IF NOT EXISTS idx_activities_faculty ON activities(faculty_id);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);`);

        // 5. API Scores Cache
        await pool.query(`
      CREATE TABLE IF NOT EXISTS api_scores (
          faculty_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          academic_year VARCHAR(20) NOT NULL,
          total_score DECIMAL(7, 2) DEFAULT 0,
          teaching_score DECIMAL(7, 2) DEFAULT 0,
          co_curricular_score DECIMAL(7, 2) DEFAULT 0,
          research_score DECIMAL(7, 2) DEFAULT 0,
          last_recalculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (faculty_id, academic_year)
      );
    `);
        console.log('API Scores table checked.');

        // 6. Narratives Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS narratives (
          id SERIAL PRIMARY KEY,
          faculty_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          academic_year VARCHAR(20) NOT NULL,
          category activity_category NOT NULL,
          narrative_text TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(faculty_id, academic_year, category)
      );
    `);
        console.log('Narratives table checked.');

        console.log('Database setup completed successfully! You can now run the backend server.');
    } catch (err) {
        console.error('Error setting up the database. Make sure your database "faculty_tracker" exists and credentials are correct in db.js.');
        console.error(err);
    } finally {
        pool.end();
    }
}

setupDatabase();
