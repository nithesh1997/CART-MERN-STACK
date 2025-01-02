const express = require('express');
const { 
    registerUser, 
    loginUser, 
    logoutUser, 
    forgotPassword, 
    resetPassword, 
    getUserProfile,
    changePassword,
} = require('../controllers/authController');
const { isAuthenticatedUser } = require('../middlewares/authenticate');
const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(logoutUser);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').post(resetPassword);
router.route('/myProfile').get(isAuthenticatedUser, getUserProfile)
router.route('/password/change').get(isAuthenticatedUser, changePassword)

module.exports = router;