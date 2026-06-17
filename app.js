// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const connectDB = require('./config/database');
const errorHandler = require('./middlewares/errorMiddleware');
const AppError = require('./utils/errorHandler');

// استدعاء المسارات
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const quizRoutes = require('./routes/quizRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const couponRoutes = require('./routes/couponRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const { webhookCheckout } = require('./controllers/paymentController');


const app = express();
connectDB();

app.post(
    '/webhook-checkout',
    express.raw({ type: 'application/json' }),
    webhookCheckout
);

// Security Middlewares
app.use(helmet());

// الحد من الطلبات المتكررة (مثال: 100 طلب لكل IP خلال 15 دقيقة)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 100, // الحد الأقصى للطلبات
    message: 'تم تجاوز الحد الأقصى للطلبات من هذا الـ IP، يرجى المحاولة بعد 15 دقيقة'
});
app.use('/api', limiter);
// الاتصال بقاعدة البيانات


// (Middlewares)
app.use(express.json({ limit: '10kb' }));

// // حماية قاعدة البيانات من حقن NoSQL
// app.use(mongoSanitize());

// حماية ضد هجمات XSS
app.use(xss());

// حماية من تلوث المعاملات (مع السماح بتكرار بعض الفلاتر الخاصة بالبحث)
app.use(hpp({
    whitelist: [
        'price',
        'ratingsAverage',
        'category'
    ]
}));

// Enable CORS 
app.use(cors()); // allow CORS for all origins


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // record HTTP requests in development mode
}

// Mount Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/instructor', instructorRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/payments', paymentRoutes);


// handle unexpected routes (404)
app.all(/.*/, (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        console.log(`Server is running on port ${PORT}`);
    });
}


module.exports = app;
