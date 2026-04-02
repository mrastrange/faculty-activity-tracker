const express = require('express');
const router = express.Router();
const { saveNarrative, getMyNarrative, getFacultyNarratives } = require('../controllers/narrativeController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

router.post('/', protect, authorizeRoles('Faculty', 'HOD', 'Admin'), saveNarrative);
router.get('/', protect, authorizeRoles('Faculty', 'HOD', 'Admin'), getMyNarrative);
router.get('/faculty/:id', protect, authorizeRoles('Admin', 'HOD'), getFacultyNarratives);

module.exports = router;
