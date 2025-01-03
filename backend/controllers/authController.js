const catchAsyncError = require('../middlewares/catchAsynError');
const User = require('../models/userModel');
const sendEmail = require('../utils/email');
const ErrorHandler = require("../utils/errorHandler")
const sendToken = require('../utils/jwt')
const crypto = require('crypto');

//Register User - /api/v1/register
exports.registerUser = catchAsyncError(async (req, res, next) => {
    const {name, email, password, avatar} = req.body
    const user = await User.create({
        name,
        email,
        password,
        avatar
    });

    sendToken(user, 201, res);
})

// Login user - /api/v1/login
exports.loginUser = catchAsyncError(async (req, res, next) => {
    const {email, password} = req.body;

    if(!email || !password){
        return next(new ErrorHandler('Please enter email & password', 400))
    }

    // finding the user database
    const user = await User.findOne({email}).select('+password');

    if(!user){
        return next(new ErrorHandler('Invalid email or password', 401))
    }

    if(!await user.isValidPassword(password)){
        return next(new ErrorHandler('Invalid email or password', 401))
    } 

    sendToken(user, 201, res);
})

// Logout - /api/v1/logout
exports.logoutUser = (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    .status(200)
    .json({
        success: true,
        message: "Logged_Out"
    })
}

//Forgot Password - /api/v1/password/forgot
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler('User not found with this email', 404));
    }

    // Generate reset token
    let resetToken;
    try {
        resetToken = user.getResetToken();

        await user.save({ validateBeforeSave: false });
        // console.log('Reset Token:', resetToken);
        // console.log('Hashed Token:', user.resetPasswordToken);
    } catch (err) {
        console.error('Error generating reset token:', err.message);
        return next(new ErrorHandler('Error generating reset token', 500));
    }

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;
    const message = `Your password reset URL is as follows: \n\n${resetUrl}\n\nIf you did not request this, please ignore.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'JVLcart Password Recovery',
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email}`,
        });
    } catch (error) {
        console.error('Error sending email:', error.message);

        // Reset token values in case of email sending failure
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 502));
    }
});
 
// Reset Password - /api/v1/password/reset/:token
exports.resetPassword = catchAsyncError( async(req, res, next)=>{
    let resetPasswordToken;
    try {
         resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        // console.log('Reset Password Token:', resetPasswordToken);
    } catch (error) {
        // console.error('Error using crypto:', error.message);
        return next(new ErrorHandler('Crypto module is not functioning correctly', 500));
    }

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire: {
            $gt : Date.now()
        }
    })

    if(!user){
        return next(new ErrorHandler('Password reset token is invalid or expired'));
    }

    if( req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Password does not Match'));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({
        validateBeforeSave: false
    })

    sendToken(user, 201, res)
})

// Get User Profile - /api/v1/myprofile
exports.getUserProfile = catchAsyncError(async (req, res, next) => {
    const user =  await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
})

// Change Password - /api/v1/password/change
exports.changePassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check old password
    if(!await user.isValidPassword(req.body.oldPassword)){
        return next(new ErrorHandler('Old Password is incorrect', 401));
    }

    // assigning new password
    user.password = req.body.password;
    await user.save();

    res.status(200).json({
        success: true
    })
})


// Update Profile
exports.updateProfile = catchAsyncError(async (req, res, next) =>{
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        user
    })
})

// Admin: Get All Users -  /api/v1/admin/users
exports.getAllUsers = catchAsyncError(async (req, res, next)=>{
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
})

// Admin: Get Specific User - /api/v1/admin/user/:id
exports.getUser = catchAsyncError(async (req, res, next) => {
    let user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorEvent(`User not found with this id ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    })
})

// Admin: Update User - /api/v1/admin/user/:id
exports.updateUser = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        user
    })
})


// Admin: Delete User - /api/v1/admin/user/:id
exports.deleteUser = catchAsyncError(async (req, res, next) => {
    let user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User not found with this id ${req.params.id}`))
    }
    await User.deleteOne({ _id: user._id });

    res.status(200).json({
        success: true,
    })
    
})