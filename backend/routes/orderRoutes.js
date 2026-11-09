const express = require('express');
const { body } = require('express-validator');
const { getOrders, getOrderById, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { requireAuth, resolveTenant } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(requireAuth, resolveTenant, apiLimiter);

// GET /api/orders - List orders for the authenticated restaurant
router.get('/', getOrders);

// GET /api/orders/:orderId - Get single order detail
router.get('/:orderId', getOrderById);

// PATCH /api/orders/:orderId/status - Update order status
router.patch(
  '/:orderId/status',
  [body('status').isIn(['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED']).withMessage('Invalid status')],
  updateOrderStatus
);

// PATCH /api/orders/:orderId/cancel - Cancel an order
router.patch(
  '/:orderId/cancel',
  [body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters')],
  cancelOrder
);

module.exports = router;