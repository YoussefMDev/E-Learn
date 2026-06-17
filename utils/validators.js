const { body, param, validationResult } = require('express-validator');

// دالة مركزية للتعامل مع أخطاء التحقق وإرجاعها للمستخدم بدلاً من انهيار السيرفر
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

exports.registerValidator = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidationErrors
];

exports.loginValidator = [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required'),
    handleValidationErrors
];

exports.updateUserValidator = [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please include a valid email'),
    handleValidationErrors
];

exports.courseValidator = [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    handleValidationErrors
];

exports.lessonValidator = [
    body('title').notEmpty().withMessage('Title is required'),
    handleValidationErrors
];

exports.enrollValidator = [
    body('courseId').isMongoId().withMessage('Invalid Course ID'),
    handleValidationErrors
];

exports.progressValidator = [
    body('progress').isNumeric().isInt({ min: 0, max: 100 }).withMessage('Progress must be 0-100'),
    handleValidationErrors
];

exports.reviewValidator = [
    body('rating').isNumeric().isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('comment').notEmpty().withMessage('Comment is required'),
    handleValidationErrors
];

exports.quizValidator = [
    body('title').notEmpty().withMessage('Quiz title is required'),
    handleValidationErrors
];

exports.questionValidator = [
    body('text').notEmpty().withMessage('Question text is required'),
    body('options').isArray({ min: 2 }).withMessage('At least two options are required'),
    body('correctAnswer').notEmpty().withMessage('Correct answer is required'),
    handleValidationErrors
];

exports.couponValidator = [
    body('code').notEmpty().withMessage('Coupon code is required'),
    body('discount').isNumeric().isInt({ min: 1, max: 100 }).withMessage('Discount 1-100'),
    body('expiresAt').isISO8601().toDate().withMessage('Invalid expiration date'),
    handleValidationErrors
];

exports.idParamValidator = (paramName = 'id') => [
    param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
    handleValidationErrors
];

exports.courseIdParamValidator = [
    param('courseId').isMongoId().withMessage('Invalid Course ID'),
    handleValidationErrors
];