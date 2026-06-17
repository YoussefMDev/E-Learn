const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    // يدعم التسميتين معاً (student و user) لمنع حدوث أي خطأ تحقق أثناء الإدخال والتكامل مع Postman
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'يرجى تحديد الكورس المراد التسجيل به']
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    completedAt: {
        type: Date
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    }
});

// منع التسجيل المكرر بكلا الشكلين لضمان سلامة البيانات ومنع الازدواجية
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);