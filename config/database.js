const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // تمرير الرابط فقط بدون أي خيارات إضافية
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        process.exit(1); 
    }
};

module.exports = connectDB;