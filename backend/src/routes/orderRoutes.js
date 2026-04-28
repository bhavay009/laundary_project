const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');
const validateOrder = require('../middleware/validateOrder');

router.route('/').get(getOrders).post(validateOrder, createOrder);

router.route('/:id').get(getOrder).put(updateOrder).delete(deleteOrder);

router.patch('/:id/status', updateOrderStatus);

module.exports = router;
