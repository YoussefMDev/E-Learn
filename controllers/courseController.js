// controllers/courseController.js
const Course = require('../models/courseModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/errorHandler');
const cloudinary = require('../config/cloudinary');

// دالة مساعدة لرفع الـ Buffer الخاص بـ Sharp إلى Cloudinary كـ Stream
const uploadStreamToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'e-learn-platform/courses' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(buffer);
    });
};

// 1. جلب جميع الكورسات (مع الفلترة والبحث والترتيب والـ Pagination)
exports.getAllCourses = async (req, res, next) => {
    try {
        const features = new APIFeatures(Course.find().populate('instructor', 'name email'), req.query)
            .filter()
            .search()
            .paginate();

        const courses = await features.query;

        res.status(200).json({
            status: 'success',
            results: courses.length,
            data: { courses }
        });
    } catch (error) {
        next(error);
    }
};

// 2. جلب كورس واحد بواسطة الـ ID
exports.getCourseById = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id).populate('instructor', 'name email');
        
        if (!course) {
            return next(new AppError('لا توجد دورة تعليمية مسجلة بهذا المعرف', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { course }
        });
    } catch (error) {
        next(error);
    }
};

// 3. إنشاء كورس جديد (للمحاضر والأدمن)
exports.createCourse = async (req, res, next) => {
    try {
        // ربط الكورس بالمحاضر الحالي مسجل الدخول
        req.body.instructor = req.user.id;

        // إذا تم رفع صورة ومعالجتها عبر Sharp، يتم رفعها الآن لـ Cloudinary
        if (req.body.imageBuffer) {
            const uploadResult = await uploadStreamToCloudinary(req.body.imageBuffer);
            req.body.coverImage = uploadResult.secure_url;
        }

        const newCourse = await Course.create(req.body);

        res.status(201).json({
            status: 'success',
            data: { course: newCourse }
        });
    } catch (error) {
        next(error);
    }
};

// 4. تحديث بيانات كورس قائم
exports.updateCourse = async (req, res, next) => {
    try {
        // إذا تم تحديث الصورة
        if (req.body.imageBuffer) {
            const uploadResult = await uploadStreamToCloudinary(req.body.imageBuffer);
            req.body.coverImage = uploadResult.secure_url;
        }

        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedCourse) {
            return next(new AppError('لم يتم العثور على الدورة التعليمية لتحديثها', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { course: updatedCourse }
        });
    } catch (error) {
        next(error);
    }
};

// 5. حذف كورس بالكامل
exports.deleteCourse = async (req, res, next) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);

        if (!course) {
            return next(new AppError('لم يتم العثور على الدورة التعليمية لحذفها', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};