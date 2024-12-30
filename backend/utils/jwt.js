const sendToken = (user, statusCode, res) => {

    // Creating JWT Token
    const token = user.getJwtToken();

    res.status(statusCode).json({
        success: true,
        user,
        token
    })
}

module.exports = sendToken;