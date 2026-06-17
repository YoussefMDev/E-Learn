// routes/reviewRoutes.js
const express = require('express');
const { 
    createReview, 
    getCourseReviews, 
    updateReview, 
    deleteReview 
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// تفعيل mergeParams لربطه مع مسار الكورسات
const router = express.Router({ mergeParams: true });

router.route('/')
    .get(getCourseReviews) // متاح للجميع لرؤية التقييمات
    .post(protect, restrictTo('student'), createReview); // الطلاب فقط من يمكنهم التقييم

router.route('/:id')
    .put(protect, restrictTo('student'), updateReview) // الطالب يعدل تقييمه
    .delete(protect, restrictTo('student', 'admin'), deleteReview); // الطالب أو الأدمن يحذف التقييم

module.exports = router;