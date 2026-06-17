const mongoose = require('mongoose');


let isConnected = false;

const connectDB = async () => {
    
    if (isConnected) {
        console.log('=> استخدام اتصال قاعدة البيانات النشط حالياً');
        return;
    }

    
    if (!process.env.MONGO_URI) {
        console.error('=> خطأ: لم يتم العثور على متغير البيئة MONGO_URI!');
        return;
    }

    console.log('=> إنشاء اتصال جديد بقاعدة البيانات...');
    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        
        // حفظ حالة الاتصال (1 تعني متصل بنجاح)
        isConnected = db.connections[0].readyState;
        console.log(`MongoDB Connected: ${db.connection.host}`);
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        throw error;
    }
};

module.exports = connectDB;