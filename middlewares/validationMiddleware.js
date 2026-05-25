// middlewares/validationMiddleware.js
const { body, validationResult } = require('express-validator');

// قواعد التحقق الخاصة ببيانات الكورس
exports.validateCourse = [
    body('title')
        .notEmpty().withMessage('عنوان الدورة التعليمية مطلوب بشكل أساسي')
        .isLength({ max: 100 }).withMessage('عنوان الدورة لا يمكن أن يتجاوز 100 حرف'),
    body('description')
        .notEmpty().withMessage('وصف الدورة التعليمية مطلوب'),
    body('price')
        .notEmpty().withMessage('سعر الدورة مطلوب')
        .isFloat({ min: 0 }).withMessage('يجب أن يكون السعر رقماً موجباً'),
    body('category')
        .notEmpty().withMessage('تصنيف الدورة مطلوب واختياره إلزامي')
];

// الدالة الوسيطة المركزية لفحص نتائج التحقق وإرجاع الأخطاء إن وجدت
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'fail',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};