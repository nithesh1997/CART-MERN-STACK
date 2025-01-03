const catchAsyncError = require('../middlewares/catchAsyncError');

// Create New Order - api/v1/order/new
exports.newOrder = catchAsyncError()