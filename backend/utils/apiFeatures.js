class APIfeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    search() {
        const keyword = this.queryString.keyword ? {
            name: {
                $regex: this.queryString.keyword,
                $options: 'i'
            }
        } : {}

        this.query = this.query.find({...keyword});
        return this;
    }

    filter() {
        const queryStringCopy = {...this.queryString};
        
        //Removing fields from query
        const removeFields = ['keyword', 'limit', 'page']
        removeFields.map(el => delete queryStringCopy[el]);

       
        // Filter for price, ratings...
        let queryString = JSON.stringify(queryStringCopy)
        queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)


        this.query = this.query.find(JSON.parse(queryString));
        return this;
    }

    pagination(resultPerPage){
        const currentPage = Number(this.queryString.page) || 1;
        const skip = resultPerPage * (currentPage -1);

        this.query = this.query.limit(resultPerPage).skip(skip);

        return this
    }

}

module.exports = APIfeatures;