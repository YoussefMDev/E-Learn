// models/reviewModel.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'review must belong to a user']
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        required: [true, 'review must belong to a course']
    },
    rating: {
        type: Number,
        min: [1, 'lowest rating is 1'],
        max: [5, 'highest rating is 5'],
        required: [true, 'rating is required']
    },
    comment: {
        type: String,
        required: [true, 'comment is required']
    }
}, { timestamps: true });

// منع المستخدم من تقييم نفس الكورس أكثر من مرة
reviewSchema.index({ course: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);