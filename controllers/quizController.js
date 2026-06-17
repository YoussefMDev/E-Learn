// controllers/quizController.js
const Quiz = require('../models/quizModel');
const AppError = require('../utils/errorHandler');

// @desc    إنشاء اختبار جديد (للمحاضر)
exports.createQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.create(req.body);
        res.status(201).json({ status: 'success', data: { quiz } });
    } catch (error) {
        next(error);
    }
};

// @desc    جلب اختبار (بدون إرجاع الإجابات الصحيحة للطالب)
exports.getQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return next(new AppError('Quiz not found', 404));

        // إخفاء الإجابات الصحيحة إذا كان المستخدم طالباً
        let quizData = quiz.toObject();
        if (req.user.role === 'student') {
            quizData.questions.forEach(q => delete q.correctAnswerIndex);
        }

        res.status(200).json({ status: 'success', data: { quiz: quizData } });
    } catch (error) {
        next(error);
    }
};

// @desc    تصحيح الاختبار للطالب
exports.submitQuiz = async (req, res, next) => {
    try {
        const { answers } = req.body; // المصفوفة التي يرسلها الطالب [0, 2, 1, ...]
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return next(new AppError('Quiz not found', 404));

        let score = 0;
        quiz.questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswerIndex) {
                score++;
            }
        });

        const percentage = Math.round((score / quiz.questions.length) * 100);
        const passed = percentage >= quiz.passingScore;

        res.status(200).json({
            status: 'success',
            data: { 
                score: percentage,
                passed,
                correctAnswersCount: score,
                totalQuestions: quiz.questions.length
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    تحديث اختبار (للمحاضر)
// @desc    تحديث اختبار قائم
exports.updateQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!quiz) return next(new AppError('Quiz not found', 404));
        res.status(200).json({ status: 'success', data: { quiz } });
    } catch (error) {
        next(error);
    }
};

// @desc    حذف اختبار
exports.deleteQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findByIdAndDelete(req.params.id);
        if (!quiz) return next(new AppError('Quiz not found', 404));
        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        next(error);
    }
};