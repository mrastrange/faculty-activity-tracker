const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyOTP, getMe, checkEmail, setupPassword, getAllUsers } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

router.post('/register', registerUser); // Public registration
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/check-email', checkEmail);
router.post('/setup-password', setupPassword);
router.get('/me', protect, getMe);
router.get('/all', protect, authorizeRoles('Admin', 'HOD'), getAllUsers);

module.exports = router;
