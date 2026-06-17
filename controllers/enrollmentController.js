// controllers/enrollmentController.js
const Enrollment = require('../models/enrollmentModel');
const Course = require('../models/courseModel');
const ErrorHandler = require('../utils/errorHandler');
const PDFDocument = require('pdfkit'); // استخدام المكتبة مباشرة من package.json دون ملفات خارجية

// @desc    تسجيل طالب في كورس
// @route   POST /api/v1/enrollments
// @access  Private (Student)
exports.enrollStudent = async (req, res, next) => {
    try {
        // قراءة معرف الكورس بمرونة من الحقل المتوقع في الـ validators وهو "courseId"
        const courseId = req.body.courseId || req.body.course;
        const studentId = req.user.id; // قادم من protect middleware

        if (!courseId) {
            return next(new ErrorHandler('Please provide a courseId', 400));
        }

        // التحقق من وجود الكورس في قاعدة البيانات السحابية
        const course = await Course.findById(courseId);
        if (!course) {
            return next(new ErrorHandler('Course not found', 404));
        }

        // التحقق من عدم تسجيل الطالب في الكورس مسبقاً
        const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId });
        if (existingEnrollment) {
            return next(new ErrorHandler('You are already enrolled in this course', 400));
        }

        // إنشاء سجل التحاق جديد متوافق مع الموديل الحالي
        const enrollment = await Enrollment.create({
            student: studentId,
            course: courseId
        });

        res.status(201).json({
            success: true,
            data: enrollment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    جلب الكورسات المسجل بها الطالب الحالي
// @route   GET /api/v1/enrollments/myenrollments
// @access  Private (Student)
exports.getMyEnrollments = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        const enrollments = await Enrollment.find({ student: studentId }).populate({
            path: 'course',
            select: 'title description image instructor price',
            populate: { path: 'instructor', select: 'name email' }
        });

        res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrollments
        });
    } catch (error) {
        next(error);
    }
};

// @desc    تحديث نسبة تقدم الطالب في الكورس
// @route   PUT /api/v1/enrollments/:id/progress
// @access  Private (Student)
exports.updateEnrollmentProgress = async (req, res, next) => {
    try {
        const { progress } = req.body;
        const studentId = req.user.id;

        let enrollment = await Enrollment.findById(req.params.id);
        if (!enrollment) {
            return next(new ErrorHandler('Enrollment not found', 404));
        }

        // التحقق من أن السجل يخص الطالب الحالي
        if (enrollment.student.toString() !== studentId) {
            return next(new ErrorHandler('Not authorized to update this enrollment', 403));
        }

        enrollment.progress = progress;
        if (progress === 100 && !enrollment.completedAt) {
            enrollment.completedAt = Date.now();
        }

        await enrollment.save();
        res.status(200).json({
            success: true,
            data: enrollment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    تحميل شهادة إتمام الكورس بصيغة PDF
// @route   GET /api/v1/enrollments/:id/certificate
// @access  Private (Student)
exports.getCompletionCertificate = async (req, res, next) => {
    try {
        const studentId = req.user.id;

        const enrollment = await Enrollment.findById(req.params.id)
            .populate('student', 'name email')
            .populate('course', 'title');

        if (!enrollment) {
            return next(new ErrorHandler('Enrollment not found', 404));
        }

        // التأكد من ملكية الشهادة للطالب
        if (enrollment.student._id.toString() !== studentId) {
            return next(new ErrorHandler('Not authorized to access this certificate', 403));
        }

        // التأكد من إكمال الكورس بنسبة 100%
        if (enrollment.progress < 100) {
            return next(new ErrorHandler('Please complete the course to 100% first', 400));
        }

        const courseTitle = enrollment.course ? enrollment.course.title : 'Course';
        const studentName = enrollment.student ? enrollment.student.name : 'Student';
        const completedDate = enrollment.completedAt ? new Date(enrollment.completedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : new Date().toLocaleDateString();

        // توليد ملف PDF ديناميكي عالي الجودة وإرساله مباشرة للاستجابة
        const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=certificate_${courseTitle.replace(/\s+/g, '_')}.pdf`);
        doc.pipe(res);

        // رسم إطار جمالي خارجي للشهادة
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(4).strokeColor('#00C49F').stroke();
        doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).lineWidth(1).strokeColor('#2c3e50').stroke();

        // كتابة نصوص الشهادة وتنسيقها
        doc.font('Helvetica-Bold').fontSize(40).fillColor('#2c3e50').text('Certificate of Completion', { align: 'center', y: 100 });
        doc.font('Helvetica').fontSize(18).fillColor('#7f8c8d').text('This is proudly presented to', { align: 'center', y: 180 });
        doc.font('Helvetica-Bold').fontSize(32).fillColor('#00C49F').text(studentName, { align: 'center', y: 220 });
        doc.font('Helvetica').fontSize(18).fillColor('#7f8c8d').text('for successfully completing the course', { align: 'center', y: 280 });
        doc.font('Helvetica-Bold').fontSize(24).fillColor('#2c3e50').text(courseTitle, { align: 'center', y: 320 });
        doc.font('Helvetica-Oblique').fontSize(14).fillColor('#95a5a6').text(`Completed on ${completedDate}`, { align: 'center', y: 380 });

        // التوقيعات أسفل الشهادة
        doc.moveTo(100, 480).lineTo(300, 480).lineWidth(1).strokeColor('#bdc3c7').stroke();
        doc.font('Helvetica').fontSize(12).fillColor('#7f8c8d').text('Instructor', 170, 490);

        doc.moveTo(doc.page.width - 300, 480).lineTo(doc.page.width - 100, 480).lineWidth(1).strokeColor('#bdc3c7').stroke();
        doc.text('E-Learn Platform', doc.page.width - 230, 490);

        doc.end();
    } catch (error) {
        next(error);
    }
};