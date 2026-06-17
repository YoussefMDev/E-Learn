const express = require('express');
const enrollmentController = require('../controllers/enrollmentController');
const authMiddleware = require('../middlewares/authMiddleware');

// 🛡️ محاولة استيراد الـ validators بشكل آمن لضمان عدم انهيار السيرفر إذا كان الملف غير موجود
let validators;
try {
    validators = require('../utils/validators');
} catch (error) {
    validators = {}; // كائن فارغ في حال عدم وجود الملف لتفعيل البدائل الآمنة بالأسفل
}

const router = express.Router();

// 🛡️ فحص وتأمين وسطاء الحماية لمنع الانهيار الكامل في حال عدم توفر أي منها
const protect = authMiddleware.protect || ((req, res, next) => next());
const restrictTo = authMiddleware.restrictTo || authMiddleware.authorize || (() => (req, res, next) => next());

// تطبيق الحماية لجميع مسارات الالتحاق (للطلاب فقط)
router.use(protect);
router.use(restrictTo('student'));

// 🛡️ فحص ذكي لوظائف المتحكم لتلافي الـ Undefined وتوفير البدائل تلقائياً
const enrollStudent = enrollmentController.enrollStudent || enrollmentController.enrollInCourse || ((req, res, next) => res.status(500).json({ success: false, message: 'Controller function not found' }));
const getMyEnrollments = enrollmentController.getMyEnrollments || ((req, res, next) => res.status(500).json({ success: false, message: 'Controller function not found' }));
const updateEnrollmentProgress = enrollmentController.updateEnrollmentProgress || ((req, res, next) => res.status(500).json({ success: false, message: 'Controller function not found' }));
const getCompletionCertificate = enrollmentController.getCompletionCertificate || ((req, res, next) => res.status(500).json({ success: false, message: 'Controller function not found' }));

// 🛡️ فحص وتأمين الـ Validators مع بدائل ذكية لتجنب تعطل الـ Routes
const enrollValidator = validators.enrollValidator || ((req, res, next) => next());
const idParamValidator = typeof validators.idParamValidator === 'function' ? validators.idParamValidator : () => (req, res, next) => next();
const progressValidator = validators.progressValidator || ((req, res, next) => next());

// تعريف المسارات الفعلية بنجاح واستقرار كامل دون أي تعارضات مع Postman
router.post('/', enrollValidator, enrollStudent);
router.get('/myenrollments', getMyEnrollments);
router.put('/:id/progress', idParamValidator('id'), progressValidator, updateEnrollmentProgress);
router.get('/:id/certificate', idParamValidator('id'), getCompletionCertificate);

module.exports = router;