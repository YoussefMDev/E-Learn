// models/lessonModel.js
const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'lesson title is required'],
        trim: true
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        required: [true, 'lesson must belong to a course']
    },
    videoUrl: {
        type: String,
        required: [true, 'video link is required']
    },
    duration: {
        type: Number, // مدة الفيديو بالدقائق
        required: [true, 'lesson duration is required']
    },
    order: {
        type: Number, // ترتيب الدرس داخل الكورس
        required: [true, 'lesson order is required']
    },
    isFreePreview: {
        type: Boolean,
        default: false // هل الدرس مجاني كعينة للمشاهدة قبل الشراء؟
    }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);