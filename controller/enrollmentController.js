// controllers/enrollmentController.js
const Enrollment = require('../models/enrollmentModel');
const Lesson = require('../models/lessonModel');
const AppError = require('../utils/errorHandler');

// @desc    تسجيل طالب في كورس
exports.enrollStudent = async (req, res, next) => {
    try {
        const courseId = req.body.course;
        const userId = req.user.id; // من الـ authMiddleware

        // التحقق مما إذا كان مسجلاً بالفعل
        const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
        if (existingEnrollment) {
            return next(new AppError('you are already enrolled in this course', 400));
        }

        const enrollment = await Enrollment.create({ user: userId, course: courseId });
        res.status(201).json({ status: 'success', data: { enrollment } });
    } catch (error) {
        next(error);
    }
};

// @desc    جلب الكورسات التي اشترك فيها الطالب
exports.getMyEnrollments = async (req, res, next) => {
    try {
        const enrollments = await Enrollment.find({ user: req.user.id }).populate('course', 'title coverImage');
        res.status(200).json({ status: 'success', results: enrollments.length, data: { enrollments } });
    } catch (error) {
        next(error);
    }
};

// @desc    تحديث التقدم (عند مشاهدة درس)
exports.updateProgress = async (req, res, next) => {
    try {
        const { lessonId } = req.body;
        const enrollment = await Enrollment.findById(req.params.id);

        if (!enrollment) return next(new AppError('Enrollment record not found', 404));
        if (enrollment.user.toString() !== req.user.id) return next(new AppError('you are not allowed to modify this record', 403));

        // إضافة الدرس إذا لم يكن مكتملاً من قبل
        if (!enrollment.completedLessons.includes(lessonId)) {
            enrollment.completedLessons.push(lessonId);

            // حساب النسبة المئوية
            const totalLessons = await Lesson.countDocuments({ course: enrollment.course });
            enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);

            await enrollment.save();
        }

        res.status(200).json({ status: 'success', data: { enrollment } });
    } catch (error) {
        next(error);
    }
};

// @desc    إلغاء اشتراك طالب من الدورة (للأدمن أو المحاضر)
exports.removeStudentFromCourse = async (req, res, next) => {
    try {
        const { userId, courseId } = req.body;
        
        const enrollment = await Enrollment.findOneAndDelete({ user: userId, course: courseId });
        
        if (!enrollment) {
            return next(new AppError('this student not enrollment in this course', 404));
        }

        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        next(error);
    }
};