// controllers/enrollmentController.js
const Enrollment = require('../models/enrollmentModel');
const Course = require('../models/courseModel');
const AppError = require('../utils/errorHandler');
const generateCertificate = require('../utils/certificateGenerator');

// @desc    تسجيل طالب في كورس
exports.enrollStudent = async (req, res, next) => {
    try {
        // 1) قراءة معرف الكورس بمرونة تامة (يدعم التسميتين لمنع التعارض مع Postman)
        const courseId = req.body.course || req.body.courseId;
        const userId = req.user.id; // ممرر من authMiddleware

        if (!courseId) {
            return next(new AppError('يرجى تحديد معرف الكورس المراد التسجيل به (courseId)', 400));
        }

        // التحقق من وجود الكورس الفعلي في قاعدة البيانات السحابية أولاً
        const course = await Course.findById(courseId);
        if (!course) {
            return next(new AppError('الكورس المطلوب للتسجيل غير موجود في قاعدة البيانات', 404));
        }

        // 2) التحقق من التسجيل المسبق بمرونة (يدعم البحث بكلا الحقلين student أو user)
        const existingEnrollment = await Enrollment.findOne({
            $or: [
                { student: userId, course: courseId },
                { user: userId, course: courseId }
            ]
        });

        if (existingEnrollment) {
            return next(new AppError('أنت مسجل بالفعل في هذا الكورس', 400));
        }

        // 3) إنشاء سجل التسجيل الآمن وتغذية كلا الحقلين لضمان عدم حدوث ValidationError
        const enrollment = await Enrollment.create({
            student: userId,
            user: userId, // أمان إضافي ليتوافق مع جميع الموديلات الممكنة
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
        const enrollments = await Enrollment.find({
            $or: [{ student: userId }, { user: userId }]
        }).populate({
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

        // التحقق من الملكية يدعم student أو user
        const enrollmentUserId = enrollment.student || enrollment.user;
        if (enrollmentUserId.toString() !== userId) {
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

// @desc    تحميل شهادة إتمام الكورس
exports.getCompletionCertificate = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const enrollment = await Enrollment.findById(req.params.id)
            .populate({ path: 'student', select: 'name email' })
            .populate({ path: 'user', select: 'name email' })
            .populate('course', 'title');

        if (!enrollment) {
            return next(new AppError('سجل الالتحاق غير موجود', 404));
        }

        const studentData = enrollment.student || enrollment.user;
        if (studentData._id.toString() !== userId) {
            return next(new AppError('غير مصرح لك بتحميل هذه الشهادة', 403));
        }

        if (!enrollment.completedAt) {
            return next(new AppError('لم تقم بإتمام هذا الكورس بنسبة 100% بعد لإصدار الشهادة', 400));
        }

        const studentName = studentData.name;
        const courseName = enrollment.course.title;
        const completionDate = enrollment.completedAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=certificate_${courseName}.pdf`);
        generateCertificate(res, studentName, courseName, completionDate);
    } catch (error) {
        next(error);
    }
};