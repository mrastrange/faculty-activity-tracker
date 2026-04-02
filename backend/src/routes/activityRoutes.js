const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const {
    submitActivity,
    getMyActivities,
    getDepartmentActivities,
    getAllActivities,
    reviewActivity
} = require('../controllers/activityController');

// Faculty Routes
router.post('/', protect, authorizeRoles('Faculty', 'HOD', 'Admin'), upload.single('proof_document'), submitActivity);
router.get('/', protect, authorizeRoles('Faculty', 'HOD', 'Admin'), getMyActivities);

// HOD Routes
router.get('/department', protect, authorizeRoles('HOD', 'Admin'), getDepartmentActivities);

// Admin Routes
router.get('/all', protect, authorizeRoles('Admin'), getAllActivities);

// Review Routes (Admin/HOD)
router.put('/:id/review', protect, authorizeRoles('Admin', 'HOD'), reviewActivity);

module.exports = router;
