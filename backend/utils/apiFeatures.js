class APIFeatures{
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    search(){
        let keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: 'i',
            }
        } : {};

        this.query.find({...keyword});
        return this;
    }

    filter() {
        try {
            // Create a shallow copy of the query string object to avoid mutating the original query parameters.
            const queryStrCopy = { ...this.queryStr };
    
            // Define an array of fields to be removed from the query string.
            const removeFields = ['keyword', 'limit', 'page']; // category
    
            // Loop through the array of fields to be removed and delete them from the copied query string object.
            removeFields.forEach(field => delete queryStrCopy[field]);

            let queryStr = JSON.stringify(queryStrCopy);

            // ?price[lt]=500 // less then 500
            // ?price[gt]=1000 // greater then 1000
            // ?price[lte]=500 // less then or equal 500
            // ?price[gte]=1000 // greater then or equal 1000
            // Example format {"price":{"$lt":"200","$gte":"100"}}
            queryStr = queryStr.replace(/\b(gt|gte|lt|lte)/g, (match) => `$${match}`)
    
            // Log the modified query parameters after removing the unwanted fields.
            // console.log("After removing fields:", queryStrCopy);
    
            // Use the modified query parameters to further filter the MongoDB query.
            this.query.find(JSON.parse(queryStr));
    
        } catch (error) {
            // Catch any errors during the filtering process and log them to the console.
            console.error("Error in filter method:", error);
        }
    
        // Return the current instance of the class to allow method chaining.
        return this;
    }

    paginate(resPerPage){
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage - 1);
        this.query.limit(resPerPage).skip(skip);
        return this;
    }
    
    
}

module.exports = APIFeatures;