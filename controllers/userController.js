// controllers/userController.js
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

// @desc    register a new user
// @route   POST /api/v1/users/register
// @access  Public
exports.registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'email already exists' });
        }

        // create new user
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        // return the response with the token
        res.status(201).json({
            status: 'success',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        next(error); // pass the error to the global error handler
    }
};



// @desc    Login user and get token
exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // check if email and password are provided
        if (!email || !password) {
            return next(new AppError('Please enter email and password', 400));
        }

        // search for the user by email and include the password field
        const user = await User.findOne({ email }).select('+password');

        // check if user exists and if the password matches
        if (!user || !(await user.matchPassword(password))) {
            return next(new AppError('Invalid email or password', 401));
        }

        res.status(200).json({
            status: 'success',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    get user profile (for the logged-in user)
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ status: 'success', data: { user } });
    } catch (error) {
        next(error);
    }
};