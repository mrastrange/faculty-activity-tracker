const ActivityModel = require('../models/activityModel');
const ApiScoreModel = require('../models/apiScoreModel');
const UserModel = require('../models/userModel');
const { sendApprovalEmail } = require('../utils/emailService');

const normalizeCategory = (category) => category === 'Co-curricular' ? 'Service' : category;

const submitActivity = async (req, res, next) => {
    try {
        const { category, significance, semester, title, description, date_of_activity, quantity, suggested_score, proof_link } = req.body;
        const faculty_id = req.user.id;

        if (!title || !category || !significance) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const proof_document_path = req.file ? `uploads/${req.file.filename}` : proof_link || null;

        // Provide a default date if not passed, because UI screenshot didn't strictly show a Date input
        const activityDate = date_of_activity || new Date().toISOString().split('T')[0];

        const activityData = {
            faculty_id,
            category: normalizeCategory(category),
            significance,
            semester,
            title,
            description,
            date_of_activity: activityDate,
            proof_document_path,
            quantity: quantity ? parseInt(quantity, 10) : 1,
            suggested_score: suggested_score ? parseInt(suggested_score, 10) : 0
        };

        const activity = await ActivityModel.create(activityData);
        res.status(201).json(activity);
    } catch (error) {
        next(error);
    }
};

const getMyActivities = async (req, res, next) => {
    try {
        const activities = await ActivityModel.getByFaculty(req.user.id);
        res.status(200).json(activities);
    } catch (error) {
        next(error);
    }
};

const getDepartmentActivities = async (req, res, next) => {
    try {
        // Assume req.user.department_id is available from protect middleware (JWT)
        // Need to ensure the user actually has a department assigned
        const activities = await ActivityModel.getByDepartment(req.user.department_id);
        res.status(200).json(activities);
    } catch (error) {
        next(error);
    }
};

const getAllActivities = async (req, res, next) => {
    try {
        const activities = await ActivityModel.getAll();
        res.status(200).json(activities);
    } catch (error) {
        next(error);
    }
};

const resubmitActivity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { category, significance, semester, title, description, date_of_activity, quantity, suggested_score, proof_link } = req.body;
        const faculty_id = req.user.id;

        if (!title || !category || !significance) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existingActivity = await ActivityModel.getByIdForFaculty(id, faculty_id);
        if (!existingActivity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        if (existingActivity.status !== 'Rejected') {
            return res.status(400).json({ message: 'Only rejected activities can be modified and resubmitted' });
        }

        const proof_document_path = req.file
            ? `uploads/${req.file.filename}`
            : proof_link || existingActivity.proof_document_path || null;

        const activityDate = date_of_activity || existingActivity.date_of_activity || new Date().toISOString().split('T')[0];

        const activityData = {
            category: normalizeCategory(category),
            significance,
            semester,
            title,
            description,
            date_of_activity: activityDate,
            proof_document_path,
            quantity: quantity ? parseInt(quantity, 10) : existingActivity.quantity || 1,
            suggested_score: suggested_score ? parseInt(suggested_score, 10) : existingActivity.suggested_score || 0
        };

        const activity = await ActivityModel.resubmit(id, faculty_id, activityData);
        res.status(200).json(activity);
    } catch (error) {
        next(error);
    }
};

const reviewActivity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, review_comments, assigned_score } = req.body;
        const reviewer_id = req.user.id;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const score = status === 'Approved' ? assigned_score : 0;

        const updatedActivity = await ActivityModel.updateStatus(id, reviewer_id, review_comments, status, score);

        if (!updatedActivity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        const activityYear = new Date(updatedActivity.date_of_activity).getFullYear().toString();
        await ApiScoreModel.recalculateFacultyScore(updatedActivity.faculty_id, activityYear);

        if (status === 'Approved') {
            // Automate the Approval Email Notification to the Faculty
            try {
                const facultyUser = await UserModel.findById(updatedActivity.faculty_id);
                if (facultyUser && facultyUser.email) {
                    // Fire and forget (don't block the API response for the email dispatch)
                    sendApprovalEmail(
                        facultyUser.email,
                        updatedActivity.title,
                        updatedActivity.category,
                        updatedActivity.significance,
                        score
                    );
                }
            } catch (emailErr) {
                console.error("Failed to trigger automated approval email:", emailErr);
            }
        }

        res.status(200).json(updatedActivity);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    submitActivity,
    getMyActivities,
    getDepartmentActivities,
    getAllActivities,
    reviewActivity,
    resubmitActivity
};
