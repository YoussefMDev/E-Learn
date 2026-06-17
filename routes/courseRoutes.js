// routes/courseRoutes.js
const express = require('express');
const { 
    getAllCourses, 
    getCourseById, 
    createCourse, 
    updateCourse, 
    deleteCourse 
} = require('../controllers/courseController');

const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { uploadCourseImage, resizeCourseImage } = require('../middlewares/imageProcessingMiddleware');
const { validateCourse, validate } = require('../middlewares/validationMiddleware');

const router = express.Router();
router.use('/:courseId/reviews', require('./reviewRoutes'));
// المسارات العامة والمسارات المعتمدة على المجموعات
router.route('/')
    .get(getAllCourses)
    .post(
        protect, 
        restrictTo('instructor', 'admin'), 
        uploadCourseImage, 
        resizeCourseImage, 
        validateCourse, 
        validate, 
        createCourse
    );

router.route('/:id')
    .get(getCourseById)
    .put(
        protect, 
        restrictTo('instructor', 'admin'), 
        uploadCourseImage, 
        resizeCourseImage, 
        validateCourse, 
        validate, 
        updateCourse
    )
    .delete(
        protect, 
        restrictTo('instructor', 'admin'), 
        deleteCourse
    );

module.exports = router;