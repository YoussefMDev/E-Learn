// models/quizModel.js
const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'quiz title is required']
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        required: [true, 'quiz must belong to a course']
    },
    lesson: {
        type: mongoose.Schema.ObjectId,
        ref: 'Lesson' // optional: if the quiz is specific to a lesson rather than the entire course
    },
    questions: [
        {
            questionText: {
                type: String,
                required: [true, 'question text is required']
            },
            options: {
                type: [String],
                required: [true, 'answer options are required'],
                validate: [v => v.length >= 2, 'at least two options must be provided']
            },
            correctAnswerIndex: {
                type: Number, // رقم الإجابة الصحيحة في المصفوفة (0, 1, 2...)
                required: [true, 'the correct answer index is required']
            }
        }
    ],
    passingScore: {
        type: Number,
        default: 50 // نسبة النجاح في الاختبار
    }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);