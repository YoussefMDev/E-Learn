// routes/paymentRoutes.js
const express = require('express');
const { createCheckoutSession } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// مسار إنشاء جلسة الدفع (متاح فقط للطلاب المسجلين للدخول)
// الرابط سيكون: POST /api/v1/payments/checkout-session/:courseId
router.post('/checkout-session/:courseId', protect, createCheckoutSession);

module.exports = router;