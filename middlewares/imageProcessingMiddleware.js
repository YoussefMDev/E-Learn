// middlewares/imageProcessingMiddleware.js
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/errorHandler');

// تخزين مؤقت في الذاكرة للحصول على الـ Buffer
const multerStorage = multer.memoryStorage();

// التحقق من نوع الملف (يجب أن يكون صورة فقط)
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('الملف المرفوع ليس صورة! يرجى رفع صور فقط.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

// دالة وسيطة لاستقبال صورة الغلاف الخاصة بالكورس
exports.uploadCourseImage = upload.single('coverImage');

// معالجة وضغط الصورة باستخدام Sharp
exports.resizeCourseImage = async (req, res, next) => {
    if (!req.file) return next();

    try {
        // معالجة الصورة وتحويلها لصيغة JPEG وضغطها بنسبة 80%
        const processedBuffer = await sharp(req.file.buffer)
            .resize(800, 500, { fit: 'cover' })
            .toFormat('jpeg')
            .jpeg({ quality: 80 })
            .toBuffer();

        // تمرير الـ Buffer المعدل في كائن الطلب للاستخدام لاحقاً
        req.body.imageBuffer = processedBuffer;
        next();
    } catch (error) {
        next(new AppError('فشلت عملية معالجة الصورة المرفوعة', 500));
    }
};