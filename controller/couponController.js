// controllers/couponController.js
const Coupon = require('../models/couponModel');
const AppError = require('../utils/errorHandler');

// @desc    إنشاء كوبون جديد (للأدمن فقط)
exports.createCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({ status: 'success', data: { coupon } });
    } catch (error) {
        next(error);
    }
};

// @desc    التحقق من صلاحية الكوبون (للطالب عند الدفع)
exports.validateCoupon = async (req, res, next) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({ name: code.toUpperCase() });

        if (!coupon) {
            return next(new AppError('Coupon code is invalid', 404));
        }

        if (!coupon.isActive || new Date(coupon.expireAt) < new Date()) {
            return next(new AppError('Coupon code is expired or inactive', 400));
        }

        res.status(200).json({
            status: 'success',
            data: { 
                discount: coupon.discount,
                message: `${coupon.discount}% successfully applied`
            }
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

// @desc    حذف كوبون الخصم
exports.deleteCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) return next(new AppError('Coupon not found', 404));
        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        next(error);
    }
};