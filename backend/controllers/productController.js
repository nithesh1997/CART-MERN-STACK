const catchAsyncError = require('../middlewares/catchAsyncError');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const APIFeatures = require('../utils/apiFeatures');

//Get Products /api/v1/products

// Get product with search and filter querys /api/v1/products?keyword=Dell&category=Laptops
// Get product with price filtering querys
    // ?price[lt]=500 // less then 500
    // ?price[gt]=1000 // greater then 1000
    // ?price[lte]=500 // less then or equal 500
    // ?price[gte]=1000 // greater then or equal 1000
// Get product with pagination query ->  /api/v1/products?page=1
exports.getProducts= async (req, res, next) =>{
    const resPerPage = process.env.PAGINATE_COUNT;
    let apiFeatures = new APIFeatures(Product.find(), req.query).search().filter().paginate(resPerPage);

    const products = await apiFeatures.query;
    res.status(200).json({
        success : true,
        count: products.length,
        products
    })
}   

//Create Product/api/v1/product/new
exports.newProduct = catchAsyncError(async (req, res, next) =>{
    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        product
    })
})

// Get Single Product /api/v1/product/:id
exports.getSingleProduct = catchAsyncError(async(req, res, next) => {
    const product = await Product.findById(req.params.id);

    if(!product){
       return next(new ErrorHandler("Product not found", 400))
    }

    res.status(201).json({
        success: true,
        product
    })
})



// Update Product /api/v1/product/:id
exports.updateProduct = async(req, res, next) => {
    let product = await Product.findById(req.params.id);

    if(!product){
        return res.status(404).json({
            success: false,
            message: "Products not found"
        })
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        product
    })
}

//Delete Product /api/v1/product/:id
exports.deleteProduct = async(req, res, next) => {
    let product = await Product.findById(req.params.id);

    if(!product){
        return res.status(404).json({
            success: false,
            message: "Products not found"
        })
    }

    await Product.deleteOne({ _id: product._id });

    res.status(201).json({
        success: true,
        message: "Product Deleted!!"
    })
}