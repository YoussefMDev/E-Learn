// routes/adminRoutes.js
const express = require('express');
const { 
    getDashboardStats, 
    updateUserRole, 
    getAllUsers, 
    deleteUser, 
    getAllCourses 
} = require('../controllers/adminController'); 
const { protect, restrictTo } = require('../middlewares/authMiddleware'); // استخدام restrictTo المتوافقة مع الكود

const router = express.Router();

// جميع المسارات التالية تتطلب تسجيل الدخول وصلاحيات مشرف (Admin)
router.use(protect);
router.use(restrictTo('admin'));

// جلب إحصائيات المنصة الشاملة
router.get('/stats', getDashboardStats);

// جلب جميع المستخدمين (للمشرف فقط)
router.get('/users', getAllUsers);

// جلب جميع الكورسات (للمشرف فقط)
router.get('/courses', getAllCourses);

// العمليات على مستخدم محدد (تعديل صلاحياته أو حذفه)
router.route('/users/:id')
    .put(updateUserRole)
    .delete(deleteUser);

module.exports = router;