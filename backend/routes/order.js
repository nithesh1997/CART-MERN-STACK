const express = require("express");
const { newOrder, getSingleOrder, myOrders } = require("../controllers/orderController");
const { isAuthenticatedUser } = require("../middlewares/authenticate");
const router = express.Router();

router.route('/order/new').post(isAuthenticatedUser ,newOrder)
router.route('/order/:id').get(isAuthenticatedUser ,getSingleOrder)
router.route('/myorders').get(isAuthenticatedUser , myOrders)

module.exports = router