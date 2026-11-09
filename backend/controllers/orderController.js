const Order = require('../models/Order');
const { sendSuccess } = require('../utils/response');
const { ApiError } = require('../utils/ApiError');

const statusOrder = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'];

const isValidStatusTransition = (from, to) => {
  if (from === 'PLACED' && to === 'ACCEPTED') return true;
  if (from === 'ACCEPTED' && to === 'PREPARING') return true;
  if (from === 'PREPARING' && to === 'READY') return true;
  if (from === 'READY' && to === 'SERVED') return true;
  if (from === 'PLACED' && to === 'CANCELLED') return true;
  if (from === 'ACCEPTED' && to === 'CANCELLED') return true;
  return false;
};

const getOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const { restaurantId } = req;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;
    const filter = { restaurantId };
    if (status) {
      if (!statusOrder.includes(status)) {
        return next(new ApiError(400, 'Invalid status filter'));
      }
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { orderReference: { $regex: search, $options: 'i' } },
        { 'items.itemName': { $regex: search, $options: 'i' } },
        { tableId: { $regex: search, $options: 'i' } },
      ];
    }
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);
    sendSuccess(res, {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      restaurantId: req.restaurantId,
    });
    if (!order) {
      return next(new ApiError(404, 'Order not found'));
    }
    sendSuccess(res, order);
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;
    if (!statusOrder.includes(status)) {
      return next(new ApiError(400, 'Invalid status'));
    }
    const order = await Order.findOne({
      _id: orderId,
      restaurantId: req.restaurantId,
    });
    if (!order) {
      return next(new ApiError(404, 'Order not found'));
    }
    if (!isValidStatusTransition(order.status, status)) {
      return next(new ApiError(400, `Cannot transition from ${order.status} to ${status}`));
    }
    order.status = status;
    if (status === 'CANCELLED') {
      order.cancellationReason = note || order.cancellationReason;
    }
    if (note) {
      order.statusHistory.push({ status, at: new Date(), note });
    }
    await order.save();
    req.app.get('io')?.to(`restaurant-${order.restaurantId}`).emit('order-updated', {
      orderId: String(order._id),
      status: order.status,
    });
    sendSuccess(res, order, 'Order status updated');
  } catch (err) {
    next(err);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const order = await Order.findOne({
      _id: orderId,
      restaurantId: req.restaurantId,
    });
    if (!order) {
      return next(new ApiError(404, 'Order not found'));
    }
    if (order.status === 'CANCELLED') {
      return next(new ApiError(400, 'Order already cancelled'));
    }
    if (order.status === 'SERVED') {
      return next(new ApiError(400, 'Cannot cancel a served order'));
    }
    order.status = 'CANCELLED';
    order.cancellationReason = reason || '';
    order.statusHistory.push({ status: 'CANCELLED', at: new Date(), note: reason || '' });
    await order.save();
    req.app.get('io')?.to(`restaurant-${order.restaurantId}`).emit('order-cancelled', {
      orderId: String(order._id),
      status: order.status,
    });
    sendSuccess(res, order, 'Order cancelled');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};