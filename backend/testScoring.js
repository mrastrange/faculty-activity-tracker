const ActivityModel = require('./src/models/activityModel');
const ApiScoreModel = require('./src/models/apiScoreModel'); const pool = require('./src/config/db');

async function testScoring() {
    try {
        console.log("Creating test activities...");

        // Ensure a faculty user exists to test with
        const facultyRes = await pool.query("INSERT INTO users (first_name, last_name, email, role) VALUES ('Test', 'Faculty', 'testfaculty@college.edu', 'Faculty') ON CONFLICT (email) DO UPDATE SET role='Faculty' RETURNING id");
        let facultyId = facultyRes.rows[0].id;

        const adminRes = await pool.query("INSERT INTO users (first_name, last_name, email, role) VALUES ('Test', 'Admin', 'testadmin@college.edu', 'Admin') ON CONFLICT (email) DO UPDATE SET role='Admin' RETURNING id");
        let adminId = adminRes.rows[0].id;

        const currentYear = new Date().getFullYear().toString();

        // 1. Submit Teaching Activity (65 points)
        const a1 = await ActivityModel.create({
            faculty_id: facultyId,
            category: 'Teaching',
            significance: 'Major',
            title: 'Lectures Delivered',
            description: 'Taught OS course',
            date_of_activity: `${currentYear}-01-10`,
            quantity: 65,
            suggested_score: 65 // 65 * 1
        });

        // 2. Submit Co-curricular Activity (20 points)
        const a2 = await ActivityModel.create({
            faculty_id: facultyId,
            category: 'Co-curricular',
            significance: 'Significant',
            title: 'Organizing Workshops',
            description: 'Organized ML workshop',
            date_of_activity: `${currentYear}-02-15`,
            quantity: 2,
            suggested_score: 20 // 2 * 10
        });

        // 3. Submit Research Activity (24 points)
        const a3 = await ActivityModel.create({
            faculty_id: facultyId,
            category: 'Research',
            significance: 'Major',
            title: 'Journal Publications',
            description: 'Published paper in IEEE',
            date_of_activity: `${currentYear}-03-20`,
            quantity: 3,
            suggested_score: 24 // 3 * 8
        });

        console.log("Activities created successfully!");

        console.log("Approving activities...");
        await ActivityModel.updateStatus(a1.id, adminId, 'Approved by admin', 'Approved', a1.suggested_score);
        await ActivityModel.updateStatus(a2.id, adminId, 'Approved by admin', 'Approved', a2.suggested_score);
        await ActivityModel.updateStatus(a3.id, adminId, 'Approved by admin', 'Approved', a3.suggested_score);

        console.log("Recalculating score...");
        const newScore = await ApiScoreModel.recalculateFacultyScore(facultyId, currentYear);
        console.log("Recalculated Score result:", newScore);

        console.log(`Expected Totals => Teaching: 65, Co-curricular: 20, Research: 24, Total: 109`);

        if (newScore.total_score == 109 && newScore.teaching_score == 65 && newScore.co_curricular_score == 20 && newScore.research_score == 24) {
            console.log("\n✅ Test Passed! Scores match expected calculations.");
        } else {
            console.log("\n❌ Test Failed! Scores do not match expected calculations.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
testScoring();
