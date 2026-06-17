// routes/enrollmentRoutes.js
const express = require('express');
const { 
    enrollStudent, 
    getMyEnrollments, 
    updateProgress, 
    removeStudentFromCourse 
} = require('../controllers/enrollmentController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// جميع مسارات الاشتراكات تتطلب تسجيل الدخول
router.use(protect);

// مسارات خاصة بالطالب
router.route('/')
    .post(restrictTo('student'), enrollStudent) // الاشتراك في كورس (مجاني أو عبر نظام دفع داخلي)
    .get(restrictTo('student'), getMyEnrollments); // جلب كورسات الطالب

router.put('/:id/progress', restrictTo('student'), updateProgress); // تحديث نسبة المشاهدة

// مسار خاص بالإدارة أو المحاضر لطرد/حذف طالب من الكورس
router.delete('/remove-student', restrictTo('admin', 'instructor'), removeStudentFromCourse);

module.exports = router;