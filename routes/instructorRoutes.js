// routes/instructorRoutes.js
const express = require('express');
const { getInstructorDashboard } = require('../controllers/instructorController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// حماية المسار والتأكد من أن المستخدم بصلاحية "محاضر"
router.use(protect, restrictTo('instructor', 'admin'));

// جلب إحصائيات المحاضر
router.get('/dashboard', getInstructorDashboard);

module.exports = router;