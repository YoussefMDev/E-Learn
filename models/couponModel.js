// models/couponModel.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'coupon name is required'],
        unique: true,
        uppercase: true, // تخزين الكود بحروف كبيرة دائماً (مثل: BLACKFRIDAY50)
        trim: true
    },
    discount: {
        type: Number,
        required: [true,'discount percentage is required'],
        min: [1, 'the discount must be at least 1%'],
        max: [100, 'the discount cannot exceed 100%']
    },
    expireAt: {
        type: Date,
        required: [true,'expiration date is required']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);