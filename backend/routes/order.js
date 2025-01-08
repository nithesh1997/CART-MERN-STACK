const express = require("express");
const { newOrder, getSingleOrder, myOrders, allOrders, updateOrder, deleteOrder } = require("../controllers/orderController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/authenticate");
const router = express.Router();

router.route('/order/new').post(isAuthenticatedUser ,newOrder)
router.route('/order/:id').get(isAuthenticatedUser ,getSingleOrder)
router.route('/myorders').get(isAuthenticatedUser , myOrders)

// Admin Routes
router.route('/all/orders').get(isAuthenticatedUser, authorizeRoles('admin'), allOrders);
router.route('/order/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder)
                          .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router