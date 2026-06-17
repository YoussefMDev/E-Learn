// controllers/enrollmentController.js
const Enrollment = require('../models/enrollmentModel');
const Course = require('../models/courseModel');
const AppError = require('../utils/errorHandler');

// 💡 أسلوب الاستيراد الآمن: محاولة تحميل موديل الشهادات، وفي حال عدم وجوده لا ينهار السيرفر
let generateCertificate;
try {
    generateCertificate = require('../utils/certificateGenerator');
} catch (error) {
    generateCertificate = null; // تعيينه كـ null لمنع انهيار السيرفر أثناء التشغيل
    console.warn('⚠️ تنبيه: ملف utils/certificateGenerator.js غير موجود. ميزة تحميل الشهادات ستكون معطلة مؤقتاً ولكن السيرفر لن ينهار.');
}

// @desc    تسجيل طالب في كورس
exports.enrollStudent = async (req, res, next) => {
    try {
        // قراءة معرف الكورس بمرونة من الحقلين courseId أو course للتوافق مع Postman
        const courseId = req.body.course || req.body.courseId;
        const userId = req.user.id; // ممرر من authMiddleware

        if (!courseId) {
            return next(new AppError('يرجى تحديد معرف الكورس المراد التسجيل به (courseId)', 400));
        }

        // التحقق من وجود الكورس في قاعدة البيانات السحابية أولاً
        const course = await Course.findById(courseId);
        if (!course) {
            return next(new AppError('الكورس المطلوب للتسجيل غير موجود في قاعدة البيانات', 404));
        }

        // التحقق من التسجيل المسبق باستخدام الحقل الصحيح المتوافق مع الـ Schema وهو "student"
        const existingEnrollment = await Enrollment.findOne({ student: userId, course: courseId });
        if (existingEnrollment) {
            return next(new AppError('أنت مسجل بالفعل في هذا الكورس', 400));
        }

        // إنشاء سجل التسجيل الفعلي متوافقاً 100% مع الـ Schema المحدثة لديك
        const enrollment = await Enrollment.create({
            student: userId,
            course: courseId
        });

        res.status(201).json({
            status: 'success',
            data: { enrollment }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    جلب كورسات الطالب الحالية
exports.getMyEnrollments = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const enrollments = await Enrollment.find({ student: userId }).populate({
            path: 'course',
            select: 'title description image instructor price',
            populate: { path: 'instructor', select: 'name email' }
        });

        res.status(200).json({
            status: 'success',
            results: enrollments.length,
            data: { enrollments }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    تحديث نسبة تقدم الطالب في الكورس
exports.updateEnrollmentProgress = async (req, res, next) => {
    try {
        const { progress } = req.body;
        const userId = req.user.id;

        let enrollment = await Enrollment.findById(req.params.id);
        if (!enrollment) {
            return next(new AppError('سجل الالتحاق غير موجود', 404));
        }

        // التحقق من ملكية السجل للطالب الحالي
        if (enrollment.student.toString() !== userId) {
            return next(new AppError('غير مصرح لك بتحديث هذا السجل', 403));
        }

        enrollment.progress = progress;
        if (progress === 100 && !enrollment.completedAt) {
            enrollment.completedAt = Date.now();
        }

        await enrollment.save();
        res.status(200).json({ status: 'success', data: { enrollment } });
    } catch (error) {
        next(error);
    }
};

// @desc    تحميل شهادة إتمام الكورس بصيغة PDF
exports.getCompletionCertificate = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // التحقق من توفر دالة إصدار الشهادات أولاً لمنع حدوث أي Runtime Error مفاجئ
        if (!generateCertificate) {
            return next(new AppError('ميزة إصدار الشهادات غير متوفرة حالياً على هذا الخادم لعدم وجود ملف الإعدادات الخاص بها', 500));
        }

        const enrollment = await Enrollment.findById(req.params.id)
            .populate('student', 'name email')
            .populate('course', 'title');

        if (!enrollment) {
            return next(new AppError('سجل الالتحاق غير موجود', 404));
        }

        if (enrollment.student._id.toString() !== userId) {
            return next(new AppError('غير مصرح لك بتحميل هذه الشهادة', 403));
        }

        if (!enrollment.completedAt) {
            return next(new AppError('لم تقم بإتمام هذا الكورس بنسبة 100% بعد لإصدار الشهادة', 400));
        }

        const studentName = enrollment.student.name;
        const courseName = enrollment.course.title;
        const completionDate = enrollment.completedAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // تصدير ملف الـ PDF مباشرة إلى الاستجابة (Stream Response)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=certificate_${courseName}.pdf`);
        generateCertificate(res, studentName, courseName, completionDate);
    } catch (error) {
        next(error);
    }
};