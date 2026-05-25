// models/courseModel.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'يجب إدخال عنوان الدورة'],
        trim: true,
        maxlength: [100, 'عنوان الدورة لا يمكن أن يتجاوز 100 حرف']
    },
    description: {
        type: String,
        required: [true, 'يجب إدخال وصف الدورة']
    },
    price: {
        type: Number,
        required: [true, 'يجب تحديد سعر الدورة'],
        default: 0
    },
    instructor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: [true, 'يجب تحديد تصنيف الدورة']
    },
    coverImage: {
        type: String,
        default: 'no-image.jpg'
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'التقييم يجب أن يكون أكثر من 1'],
        max: [5, 'التقييم يجب أن يكون أقل من 5']
    }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);