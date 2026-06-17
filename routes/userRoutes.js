// routes/userRoutes.js
const express = require('express');
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// المسارات العامة (لا تتطلب تسجيل دخول)
router.post('/register', registerUser);
router.post('/login', loginUser);

// المسارات المحمية (تتطلب تسجيل دخول)
router.get('/profile', protect, getUserProfile);

module.exports = router;