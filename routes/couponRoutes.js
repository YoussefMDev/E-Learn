// routes/couponRoutes.js
const express = require('express');
const { 
    createCoupon, 
    validateCoupon, 
    getAllCoupons, 
    updateCoupon, 
    deleteCoupon 
} = require('../controllers/couponController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// مسار متاح للطلاب المسجلين للتحقق من صلاحية الكوبون قبل الدفع
router.post('/validate', protect, validateCoupon);

// باقي المسارات للإدارة (الأدمن) فقط
router.use(protect, restrictTo('admin'));

router.route('/')
    .get(getAllCoupons)
    .post(createCoupon);

router.route('/:id')
    .put(updateCoupon)
    .delete(deleteCoupon);

module.exports = router;