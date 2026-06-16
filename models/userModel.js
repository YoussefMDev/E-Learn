// models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'password is required'],
        minlength: 6,
        select: false // عدم إرجاع كلمة المرور في الاستعلامات الافتراضية
    },
    role: {
        type: String,
        enum: ['student', 'instructor', 'admin'],
        default: 'student'
    }
}, { timestamps: true });

// تشفير كلمة المرور قبل الحفظ
// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function () {
    // لو الباسورد ماتعدلش، اخرج من الدالة فوراً
    if (!this.isModified('password')) return;
    
    // لو جديد أو اتعدل، كمل تشفير
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
// دالة للتحقق من تطابق كلمة المرور
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);