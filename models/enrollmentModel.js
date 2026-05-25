// models/enrollmentModel.js
const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'must detect user id']
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        required: [true, 'must specify the course']
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100 // نسبة مئوية لتقدم الطالب في الكورس
    },
    completedLessons: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Lesson' // مصفوفة لتخزين الدروس التي أتمها الطالب
        }
    ],
    enrolledAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// منع الطالب من التسجيل في نفس الكورس أكثر من مرة
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);