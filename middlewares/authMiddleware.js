// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/errorHandler');

// حماية المسارات (يجب أن يكون مسجلاً للدخول)
exports.protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('أنت غير مسجل الدخول، يرجى تسجيل الدخول للوصول', 401));
        }

        // التحقق من صحة التوكن
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // التحقق مما إذا كان المستخدم لا يزال موجوداً
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return next(new AppError('المستخدم صاحب هذا التوكن لم يعد موجوداً', 401));
        }

        // تمرير بيانات المستخدم للطلب الحالي
        req.user = currentUser;
        next();
    } catch (error) {
        next(new AppError('توكن غير صالح أو منتهي الصلاحية', 401));
    }
};

// تحديد الصلاحيات (Roles)
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('ليس لديك صلاحية لتنفيذ هذا الإجراء', 403));
        }
        next();
    };
};