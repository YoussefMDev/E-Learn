// controllers/reviewController.js
const Review = require('../models/reviewModel');
const AppError = require('../utils/errorHandler');

// @desc    create new review
exports.createReview = async (req, res, next) => {
    try {
        req.body.user = req.user.id; // review owner

        const review = await Review.create(req.body);
        res.status(201).json({ status: 'success', data: { review } });
    } catch (error) {
        if (error.code === 11000) { // code error for duplicate key, meaning user has already reviewed the course
            return next(new AppError('you are already reviewed', 400));
        }
        next(error);
    }
};

// @desc    return all reviews for a course
exports.getCourseReviews = async (req, res, next) => {
    try {
        const filter = req.params.courseId ? { course: req.params.courseId } : {};
        const reviews = await Review.find(filter).populate('user', 'name');

        res.status(200).json({ status: 'success', results: reviews.length, data: { reviews } });
    } catch (error) {
        next(error);
    }
};

// @desc    update review
exports.updateReview = async (req, res, next) => {
    try {
        let review = await Review.findById(req.params.id);
        if (!review) return next(new AppError('review not found', 404));

        // ensure only the review owner can update the review
        if (review.user.toString() !== req.user.id) {
            return next(new AppError('you are not allowed to modify this review', 403));
        }

        review = await Review.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ status: 'success', data: { review } });
    } catch (error) {
        next(error);
    }
};

// @desc    delete review
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return next(new AppError('review not found', 404));

        // allow only the review owner or admin to delete the review
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new AppError('you are not authorized to delete this review', 403));
        }

        await review.deleteOne();
        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        next(error);
    }
};