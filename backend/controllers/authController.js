const catchAsyncError = require('../middlewares/catchAsynError');
const User = require('../models/userModel');
const sendEmail = require('../utils/email');
const ErrorHandler = require("../utils/errorHandler")
const sendToken = require('../utils/jwt')

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
        console.log('Reset Token:', resetToken);
        console.log('Hashed Token:', user.resetPasswordToken);
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
 