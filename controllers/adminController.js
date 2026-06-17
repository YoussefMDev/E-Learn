// controllers/adminController.js
const User = require('../models/userModel');
const Course = require('../models/courseModel');
const Enrollment = require('../models/enrollmentModel');
const AppError = require('../utils/errorHandler');

// @desc    جلب إحصائيات المنصة الشاملة
exports.getDashboardStats = async (req, res, next) => {
    try {
        const usersCount = await User.countDocuments();
        const coursesCount = await Course.countDocuments();
        const enrollmentsCount = await Enrollment.countDocuments();

        res.status(200).json({
            status: 'success',
            data: { usersCount, coursesCount, enrollmentsCount }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    ترقية مستخدم أو تعديل صلاحياته (محاضر أو مشرف)
exports.updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role }, {
            new: true,
            runValidators: true
        });

        if (!user) return next(new AppError('user not found', 404));

        res.status(200).json({ status: 'success', data: { user } });
    } catch (error) {
        next(error);
    }
};

// @desc    جلب جميع المستخدمين (للمشرف فقط)
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: { users }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    حذف مستخدم نهائياً (للمشرف فقط)
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) return next(new AppError('user not found', 404));

        res.status(200).json({
            status: 'success',
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    جلب جميع الكورسات (للمشرف فقط)
exports.getAllCourses = async (req, res, next) => {
    try {
        const courses = await Course.find().populate('instructor', 'name email');
        
        res.status(200).json({
            status: 'success',
            results: courses.length,
            data: { courses }
        });
    } catch (error) {
        next(error);
    }
};