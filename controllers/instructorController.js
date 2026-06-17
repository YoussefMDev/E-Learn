// controllers/instructorController.js
const Course = require('../models/courseModel');
const Enrollment = require('../models/enrollmentModel');
const AppError = require('../utils/errorHandler');

// @desc    render instructor dashboard
exports.getInstructorDashboard = async (req, res, next) => {
    try {
        // 1. retrieve all courses created by the instructor
        const courses = await Course.find({ instructor: req.user.id });
        const courseIds = courses.map(c => c._id);

        // 2. calculate the total number of students enrolled in the instructor's courses
        const totalStudents = await Enrollment.countDocuments({ course: { $in: courseIds } });

        res.status(200).json({
            status: 'success',
            data: {
                totalCourses: courses.length,
                totalStudents,
                courses // return the list of courses to display in the interface
            }
        });
    } catch (error) {
        next(error);
    }
};