const express = require('express');
const router = express.Router();
const { getFacultyDashboard, getAdminAnalytics, getAdminGraphs } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// Dashboard Routes
router.get('/faculty', protect, authorizeRoles('Faculty', 'HOD', 'Admin'), getFacultyDashboard);
router.get('/admin/analytics', protect, authorizeRoles('Admin', 'HOD'), getAdminAnalytics);
router.get('/admin/graphs', protect, authorizeRoles('Admin', 'HOD'), getAdminGraphs);

module.exports = router;
