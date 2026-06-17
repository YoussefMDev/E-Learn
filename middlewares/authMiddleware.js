// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/errorHandler');

// حماية المسارات (يجب أن يكون مسجلاً للدخول)
exports.protect = async (req, res, next) => {
    let token;

    // 1) التحقق من وجود التوكن في الـ Headers أو الـ Cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    // إذا لم يتم العثور على التوكن
    if (!token) {
        return next(new ErrorHandler('غير مصرح لك بالوصول، يرجى تسجيل الدخول أولاً', 401));
    }

    try {
        // 2) التحقق من صحة التوكن وفك التشفير
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3) البحث عن المستخدم في قاعدة البيانات الحالية
        const currentUser = await User.findById(decoded.id);
        
        // إذا كان التوكن سليماً ولكن المستخدم غير موجود في هذه القاعدة (لمنع خطأ 500)
        if (!currentUser) {
            return next(new ErrorHandler('المستخدم صاحب هذا التوكن لم يعد موجوداً في قاعدة البيانات الحالية', 401));
        }

        // 4) تمرير بيانات المستخدم للطلب للاستخدام اللاحق
        req.user = currentUser;
        next();
    } catch (error) {
        return next(new ErrorHandler('انتهت صلاحية الجلسة أو التوكن غير صالح، يرجى تسجيل الدخول مجدداً', 401));
    }
};

// تحديد الصلاحيات (Roles)
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // التحقق من دور المستخدم الحالي ومقارنته بالأدوار المسموح لها
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ErrorHandler(`غير مسموح لدورك (${req.user ? req.user.role : 'زائر'}) بالوصول لهذا المسار`, 403));
        }
        next();
    };
};