const express = require("express");
const { newOrder, getSingleOrder, myOrders, allOrders } = require("../controllers/orderController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/authenticate");
const router = express.Router();

router.route('/order/new').post(isAuthenticatedUser ,newOrder)
router.route('/order/:id').get(isAuthenticatedUser ,getSingleOrder)
router.route('/myorders').get(isAuthenticatedUser , myOrders)

// Admin Routes
router.route('/all/orders').get(isAuthenticatedUser, authorizeRoles('admin'), allOrders)

module.exports = router