// routes/quizRoutes.js
const express = require('express');
const { 
    createQuiz, 
    getQuiz, 
    submitQuiz, 
    updateQuiz, 
    deleteQuiz 
} = require('../controller/quizController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

// مسارات الطالب (عرض الاختبار وتقديم الإجابات)
router.get('/:id', getQuiz); 
router.post('/:id/submit', restrictTo('student'), submitQuiz); 

// مسارات الإدارة والمحاضرين (الـ CRUD للاختبار)
router.use(restrictTo('instructor', 'admin'));

router.post('/', createQuiz);
router.route('/:id')
    .put(updateQuiz)
    .delete(deleteQuiz);

module.exports = router;