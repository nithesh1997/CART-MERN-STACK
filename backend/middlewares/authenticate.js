const ErrorHandler = require("../utils/errorHandler");
const User = require('../models/userModel');
const catchAsynError = require("./catchAsynError");
const jwt = require('jsonwebtoken');

exports.isAuthenticatedUser = catchAsynError(async (req, res, next) =>{
    const {token} = req.cookies;

    if(!token){
        next(new ErrorHandler('Login first to handle this resource', 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
})