const express = require('express');
const { getBySlug, getMenu, getCategories, createPublicOrder, getItem, getTableByQrToken } = require('../controllers/publicRestaurantController');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const ApiError = require('../utils/ApiError');
const { publicOrderLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
// Public routes - no auth required, resolve by slug
router.get('/:slug', getBySlug);
router.get('/:slug/menu', getMenu);
router.get('/:slug/categories', getCategories);
router.post('/:slug/orders', publicOrderLimiter, createPublicOrder);
router.get('/:slug/items/:itemId', getItem);
// Table lookup by QR token - uses resolveTenant to get restaurantId from auth cookie,
// but also accepts unauthenticated requests by looking up the token globally
router.get('/:slug/tables/:qrToken', getTableByQrToken);
// Track order by tracking token - unauthenticated public endpoint
router.get('/:slug/orders/track/:trackingToken', async (req, res, next) => {
  try {
    const { trackingToken } = req.params;
    const restaurant = await Restaurant.findOne({ slug: req.params.slug, isActive: true });
    if (!restaurant) throw new ApiError(404, 'Restaurant not found');
    const order = await Order.findOne({ trackingToken, restaurantId: restaurant._id }).populate('tableId', 'tableNumber');
    if (!order) throw new ApiError(404, 'Order not found or tracking token invalid');
    res.json({ success: true, data: order });
  } catch (e) {
    next(e);
  }
});

module.exports = router;