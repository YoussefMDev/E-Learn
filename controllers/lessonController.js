// controllers/lessonController.js
const Lesson = require('../models/lessonModel');
const Course = require('../models/courseModel');
const AppError = require('../utils/errorHandler');

// @desc    إنشاء درس جديد
exports.createLesson = async (req, res, next) => {
    try {
        // التحقق من وجود الكورس أولاً
        const course = await Course.findById(req.body.course);
        if (!course) {
            return next(new AppError('الكورس المحدد غير موجود', 404));
        }

        const lesson = await Lesson.create(req.body);
        res.status(201).json({ status: 'success', data: { lesson } });
    } catch (error) {
        next(error);
    }
};

// @desc    جلب جميع دروس كورس معين
exports.getCourseLessons = async (req, res, next) => {
    try {
        // افترض أن المسار هو /api/v1/courses/:courseId/lessons
        const filter = req.params.courseId ? { course: req.params.courseId } : {};
        const lessons = await Lesson.find(filter).sort('order');

        res.status(200).json({ status: 'success', results: lessons.length, data: { lessons } });
    } catch (error) {
        next(error);
    }
};

// @desc    تحديث درس
exports.updateLesson = async (req, res, next) => {
    try {
        const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!lesson) return next(new AppError('الدرس غير موجود', 404));

        res.status(200).json({ status: 'success', data: { lesson } });
    } catch (error) {
        next(error);
    }
};

// @desc    حذف درس
exports.deleteLesson = async (req, res, next) => {
    try {
        const lesson = await Lesson.findByIdAndDelete(req.params.id);
        if (!lesson) return next(new AppError('الدرس غير موجود', 404));

        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        next(error);
    }
};