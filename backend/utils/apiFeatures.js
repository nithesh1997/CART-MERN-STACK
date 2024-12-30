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
    
            // Log the query parameters before removing unwanted fields for debugging purposes.
            // console.log("Before removing fields:", queryStrCopy);
    
            // Define an array of fields to be removed from the query string.
            // These fields are not required for filtering the database query.
            const removeFields = ['keyword', 'limit', 'page'];
    
            // Loop through the array of fields to be removed and delete them from the copied query string object.
            removeFields.forEach(field => delete queryStrCopy[field]);
    
            // Log the modified query parameters after removing the unwanted fields.
            // console.log("After removing fields:", queryStrCopy);
    
            // Use the modified query parameters to further filter the MongoDB query.
            this.query.find(queryStrCopy);
    
        } catch (error) {
            // Catch any errors during the filtering process and log them to the console.
            console.error("Error in filter method:", error);
        }
    
        // Return the current instance of the class to allow method chaining.
        return this;
    }
    
    
}

module.exports = APIFeatures;