// controllers/couponController.js
const Coupon = require('../models/couponModel');
const AppError = require('../utils/errorHandler');

// @desc    إنشاء كوبون خصم جديد
exports.createCoupon = async (req, res, next) => {
    try {
        const { code, discount, expiresAt } = req.body;
        const coupon = await Coupon.create({ code, discount, expiresAt });
        
        res.status(201).json({ 
            success: true, 
            data: coupon 
        });
    } catch (error) {
        next(error);
    }
};

// @desc    التحقق من صحة وصلاحية الكوبون
exports.validateCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findOne({ 
            code: req.params.code.toUpperCase(), 
            expiresAt: { $gt: Date.now() } 
        });
        
        if (!coupon) {
            return next(new AppError('Invalid or expired coupon code', 404));
        }
        
        res.status(200).json({ 
            success: true, 
            data: coupon 
        });
    } catch (error) {
        next(error);
    }
};

// @desc    حذف كوبون خصم
exports.deleteCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return next(new AppError('Coupon not found', 404));
        }
        
        await coupon.deleteOne();
        res.status(200).json({ 
            success: true, 
            message: 'Coupon deleted successfully' 
        });
    } catch (error) {
        next(error);
    }
};
// @desc    جلب جميع الكوبونات (للأدمن)
exports.getAllCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find();
        res.status(200).json({ status: 'success', results: coupons.length, data: { coupons } });
    } catch (error) {
        next(error);
    }
};

// @desc    تحديث كوبون الخصم
exports.updateCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!coupon) return next(new AppError('Coupon not found', 404));
        res.status(200).json({ status: 'success', data: { coupon } });
    } catch (error) {
        next(error);
    }
};

// // @desc    حذف كوبون الخصم
// exports.deleteCoupon = async (req, res, next) => {
//     try {
//         const coupon = await Coupon.findByIdAndDelete(req.params.id);
//         if (!coupon) return next(new AppError('Coupon not found', 404));
//         res.status(204).json({ status: 'success', data: null });
//     } catch (error) {
//         next(error);
//     }
// };