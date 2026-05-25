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

// @desc    ترقية مستخدم إلى محاضر أو مشرف
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