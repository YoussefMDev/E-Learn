// routes/lessonRoutes.js
// تفعيل mergeParams للوصول إلى courseId من مسار الكورسات
const express = require('express');
const { 
    createLesson, 
    getCourseLessons, 
    updateLesson, 
    deleteLesson 
} = require('../controllers/lessonController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true });

// المسارات
router.route('/')
    .get(getCourseLessons) // عرض الدروس (يمكن أن يكون متاحاً للجميع لرؤية المنهج)
    .post(protect, restrictTo('instructor', 'admin'), createLesson); // إضافة درس (للمحاضر/الأدمن)

router.route('/:id')
    .put(protect, restrictTo('instructor', 'admin'), updateLesson)
    .delete(protect, restrictTo('instructor', 'admin'), deleteLesson);

module.exports = router;