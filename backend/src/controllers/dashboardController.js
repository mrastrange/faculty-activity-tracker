const pool = require('../config/db');
const ApiScoreModel = require('../models/apiScoreModel');

const getFacultyDashboard = async (req, res, next) => {
    try {
        const faculty_id = req.user.id;
        const currentYear = new Date().getFullYear().toString();

        await ApiScoreModel.recalculateFacultyScore(faculty_id, currentYear);

        // Get total score statically from api_scores cache
        const scoreQuery = `SELECT total_score, teaching_score, co_curricular_score, research_score FROM api_scores WHERE faculty_id = $1 AND academic_year = $2`;
        const scoreResult = await pool.query(scoreQuery, [faculty_id, currentYear]);
        const totalScore = scoreResult.rows.length ? parseFloat(scoreResult.rows[0].total_score) : 0;
        const teachingScore = scoreResult.rows.length ? parseFloat(scoreResult.rows[0].teaching_score) : 0;
        const coCurricularScore = scoreResult.rows.length ? parseFloat(scoreResult.rows[0].co_curricular_score) : 0;
        const researchScore = scoreResult.rows.length ? parseFloat(scoreResult.rows[0].research_score) : 0;

        // Get activity counts
        const countQuery = `
            SELECT 
                COUNT(*) FILTER (WHERE status = 'Pending') as pending,
                COUNT(*) FILTER (WHERE status = 'Approved') as approved,
                COUNT(*) FILTER (WHERE status = 'Rejected') as rejected
            FROM activities
            WHERE faculty_id = $1
        `;
        const countResult = await pool.query(countQuery, [faculty_id]);

        // Get recent activities
        const recentQuery = `
            SELECT a.id, a.title, a.category, a.significance, a.description, a.status, a.date_of_activity, a.assigned_score, a.quantity, a.suggested_score, a.semester, a.proof_document_path
            FROM activities a
            WHERE a.faculty_id = $1
            ORDER BY a.submitted_at DESC
        `;
        const recentResult = await pool.query(recentQuery, [faculty_id]);

        res.status(200).json({
            metrics: {
                totalScore,
                teachingScore,
                coCurricularScore,
                researchScore,
                pending: parseInt(countResult.rows[0].pending) || 0,
                approved: parseInt(countResult.rows[0].approved) || 0,
                rejected: parseInt(countResult.rows[0].rejected) || 0
            },
            recentActivities: recentResult.rows
        });
    } catch (error) {
        next(error);
    }
};

const getAdminAnalytics = async (req, res, next) => {
    try {
        const currentYear = new Date().getFullYear().toString();
        await ApiScoreModel.recalculateAllScoresForYear(currentYear);

        // College-wide average API score
        const avgScoreQuery = `SELECT AVG(total_score) as average_score FROM api_scores WHERE academic_year = $1`;
        const avgResult = await pool.query(avgScoreQuery, [currentYear]);

        // Top 5 faculty overall
        const topFacultyQuery = `
            SELECT u.first_name, u.last_name, s.total_score, s.teaching_score, s.co_curricular_score, s.research_score, s.academic_year
            FROM api_scores s
            JOIN users u ON s.faculty_id = u.id
            WHERE s.academic_year = $1
            ORDER BY s.total_score DESC
            LIMIT 5
        `;
        const topFacultyResult = await pool.query(topFacultyQuery, [currentYear]);

        // Department-wise sum of scores
        const deptScoresQuery = `
            SELECT d.name as department, SUM(s.total_score) as department_score
            FROM api_scores s
            JOIN users u ON s.faculty_id = u.id
            JOIN departments d ON u.department_id = d.id
            WHERE s.academic_year = $1
            GROUP BY d.name
        `;
        const deptScoresResult = await pool.query(deptScoresQuery, [currentYear]);

        res.status(200).json({
            collegeAverage: avgResult.rows[0].average_score ? parseFloat(avgResult.rows[0].average_score).toFixed(2) : '0.00',
            topPerformers: topFacultyResult.rows,
            departmentComparisons: deptScoresResult.rows
        });
    } catch (error) {
        next(error);
    }
};

const getAdminGraphs = async (req, res, next) => {
    try {
        const currentYear = new Date().getFullYear().toString();

        const query = `
            SELECT 
                u.id, 
                u.first_name, 
                u.last_name, 
                u.designation, 
                COALESCE(s.total_score, 0) as final_score,
                (SELECT COUNT(*) FROM activities a WHERE a.faculty_id = u.id AND a.status = 'Approved') as approved_count
            FROM users u
            LEFT JOIN api_scores s ON u.id = s.faculty_id AND s.academic_year = $1
            WHERE u.role = 'Faculty' OR u.role = 'HOD'
        `;
        const { rows } = await pool.query(query, [currentYear]);

        const tenuredScatter = [];
        const nonTenuredScatter = [];
        const tenuredBarCounts = { '0-5': 0, '5-10': 0, '10-15': 0, '15-20': 0, '20+': 0 };
        const nonTenuredBarCounts = { '0-5': 0, '5-10': 0, '10-15': 0, '15-20': 0, '20+': 0 };

        let tIndex = 1;
        let ntIndex = 1;

        rows.forEach(row => {
            const isNonTenured = row.designation && row.designation.toLowerCase().includes('assistant');
            const score = parseFloat(row.final_score);
            const count = parseInt(row.approved_count);

            if (!isNonTenured) {
                tenuredScatter.push({ index: tIndex++, score, name: `${row.first_name} ${row.last_name}` });
                if (count < 5) tenuredBarCounts['0-5']++;
                else if (count < 10) tenuredBarCounts['5-10']++;
                else if (count < 15) tenuredBarCounts['10-15']++;
                else if (count < 20) tenuredBarCounts['15-20']++;
                else tenuredBarCounts['20+']++;
            } else {
                nonTenuredScatter.push({ index: ntIndex++, score, name: `${row.first_name} ${row.last_name}` });
                if (count < 5) nonTenuredBarCounts['0-5']++;
                else if (count < 10) nonTenuredBarCounts['5-10']++;
                else if (count < 15) nonTenuredBarCounts['10-15']++;
                else if (count < 20) nonTenuredBarCounts['15-20']++;
                else nonTenuredBarCounts['20+']++;
            }
        });

        const formatBarData = (counts) => Object.keys(counts).map(bucket => ({ bucket, count: counts[bucket] }));

        res.status(200).json({
            tenuredScatter,
            nonTenuredScatter,
            tenuredBar: formatBarData(tenuredBarCounts),
            nonTenuredBar: formatBarData(nonTenuredBarCounts)
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getFacultyDashboard,
    getAdminAnalytics,
    getAdminGraphs
};
