// controllers/paymentController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Course = require('../models/courseModel');
const Enrollment = require('../models/enrollmentModel');
const AppError = require('../utils/errorHandler');

// @desc    إنشاء جلسة دفع (Checkout Session) لشراء كورس
exports.createCheckoutSession = async (req, res, next) => {
    try {
        // 1. جلب الكورس المراد شراؤه
        const course = await Course.findById(req.params.courseId);
        if (!course) return next(new AppError('الدورة التعليمية غير موجودة', 404));

        // 2. إنشاء الجلسة في Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${req.protocol}://${req.get('host')}/my-courses?success=true`,
            cancel_url: `${req.protocol}://${req.get('host')}/courses/${course._id}?canceled=true`,
            customer_email: req.user.email,
            client_reference_id: req.params.courseId,
            line_items: [
                {
                    price_data: {
                        currency: 'usd,egp', // أو حسب العملة التي تستخدمها EGP مثلاً
                        unit_amount: course.price * 100, // سترايب يتعامل بالسنتات
                        product_data: {
                            name: course.title,
                            description: course.description,
                            images: [course.coverImage],
                        },
                    },
                    quantity: 1,
                },
            ],
            // إرسال معرف المستخدم في الـ metadata لنتمكن من تسجيله بعد إتمام الدفع
            metadata: {
                userId: req.user.id.toString(),
            }
        });

        // 3. إرسال استجابة برابط الجلسة للواجهة الأمامية
        res.status(200).json({ status: 'success', sessionUrl: session.url });
    } catch (error) {
        next(error);
    }
};

// @desc    Stripe Webhook (هذه الدالة تُستدعى تلقائياً من سترايب بعد نجاح الدفع)
exports.webhookCheckout = async (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body, // يجب أن يكون req.body بصيغة Raw هنا (يُعالج في app.js)
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // إذا تمت عملية الدفع بنجاح
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // تسجيل الطالب تلقائياً في الكورس
        const courseId = session.client_reference_id;
        const userId = session.metadata.userId;

        await Enrollment.create({ course: courseId, user: userId });
    }

    res.status(200).json({ received: true });
};