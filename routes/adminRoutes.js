// routes/adminRoutes.js
const express = require('express');
const { getDashboardStats, updateUserRole } = require('../controller/adminController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// جميع المسارات هنا تتطلب تسجيل الدخول وأن يكون المستخدم "أدمن"
router.use(protect);
router.use(restrictTo('admin'));

// جلب إحصائيات المنصة
router.get('/stats', getDashboardStats);

// تعديل صلاحيات مستخدم (مثل ترقية طالب إلى محاضر)
router.put('/users/:id/role', updateUserRole);

module.exports = router;