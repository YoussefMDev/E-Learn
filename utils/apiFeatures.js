// utils/apiFeatures.js
class APIFeatures {
    constructor(query, queryString) {
        this.query = query; // Mongoose Query (e.g., Course.find())
        this.queryString = queryString; // req.query
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'keyword'];
        excludedFields.forEach(el => delete queryObj[el]);

        // للبحث باستخدام <, <=, >, >= (مثل فلترة السعر)
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    search() {
        if (this.queryString.keyword) {
            const keyword = {
                title: {
                    $regex: this.queryString.keyword,
                    $options: 'i'
                }
            };
            this.query = this.query.find({ ...keyword });
        }
        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = APIFeatures;