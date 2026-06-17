const express = require('express');
const { createCoupon, validateCoupon, deleteCoupon } = require('../controllers/couponController');
const { protect, authorize, restrictTo } = require('../middlewares/authMiddleware');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();

const restrict = restrictTo || authorize || (() => (req, res, next) => next());


const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};


const couponValidator = [
    body('code')
        .notEmpty().withMessage('Please provide a coupon code')
        .trim()
        .toUpperCase(),
    body('discount')
        .isNumeric().withMessage('Discount must be a number')
        .isInt({ min: 1, max: 100 }).withMessage('Discount must be between 1 and 100'),
    body('expiresAt')
        .isISO8601().toDate().withMessage('Please provide a valid expiration date'),
    handleValidationErrors
];


const idParamValidator = [
    param('id').isMongoId().withMessage('Invalid ID format'),
    handleValidationErrors
];


router.post('/', protect, restrict('admin'), couponValidator, createCoupon);
router.get('/validate/:code', validateCoupon);
router.delete('/:id', protect, restrict('admin'), idParamValidator, deleteCoupon);

module.exports = router;