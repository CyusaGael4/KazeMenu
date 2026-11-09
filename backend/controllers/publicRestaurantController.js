const crypto = require('crypto');
const ApiError = require('../utils/ApiError');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const DiningTable = require('../models/DiningTable');
const Order = require('../models/Order');

const getBySlug = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ slug: req.params.slug });
    if (!restaurant) throw new ApiError(404, 'Restaurant not found');
    if (!restaurant.isActive) throw new ApiError(404, 'Restaurant not found');
    restaurant.currency = 'RWF';
    res.json({ success: true, data: restaurant });
  } catch (e) { next(e); }
};

const getMenu = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ slug: req.params.slug });
    if (!restaurant) throw new ApiError(404, 'Restaurant not found');

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter = { restaurantId: restaurant._id };
    if (req.query.categoryId) filter.categoryId = req.query.categoryId;
    if (req.query.isAvailable !== undefined) filter.isAvailable = req.query.isAvailable === 'true';
    if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };

    const [items, total] = await Promise.all([
      MenuItem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      MenuItem.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (e) { next(e); }
};

const getCategories = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const restaurant = await Restaurant.findOne({ slug: req.params.slug, isActive: true });
    if (!restaurant) throw new ApiError(404, 'Restaurant not found');

    const [categories, total] = await Promise.all([
      Category.find({ restaurantId: restaurant._id, isActive: true })
        .sort({ displayOrder: 1, createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Category.countDocuments({ restaurantId: restaurant._id, isActive: true }),
    ]);
    res.json({
      success: true,
      data: categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (e) { next(e); }
};

const createPublicOrder = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { qrToken, items, specialInstructions = '' } = req.body;
    if (typeof qrToken !== 'string' || !qrToken.trim()) throw new ApiError(400, 'A table QR token is required');
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      throw new ApiError(400, 'Choose between 1 and 50 menu items');
    }
    if (typeof specialInstructions !== 'string' || specialInstructions.length > 500) {
      throw new ApiError(400, 'Special instructions must be 500 characters or fewer');
    }

    const restaurant = await Restaurant.findOne({ slug, isActive: true });
    if (!restaurant) throw new ApiError(404, 'Restaurant not found');

    const table = await DiningTable.findOne({
      qrToken: qrToken.trim(),
      restaurantId: restaurant._id,
      isActive: true,
    });
    if (!table) throw new ApiError(404, 'Active table not found for this restaurant');

    const itemIds = new Set();
    for (const entry of items) {
      if (!entry || typeof entry.menuItemId !== 'string' || !/^[a-f\d]{24}$/i.test(entry.menuItemId)) {
        throw new ApiError(400, 'Every order item must include a valid menu item');
      }
      if (!Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > 99) {
        throw new ApiError(400, 'Item quantities must be whole numbers between 1 and 99');
      }
      if (entry.itemInstructions !== undefined && (
        typeof entry.itemInstructions !== 'string' || entry.itemInstructions.length > 300
      )) {
        throw new ApiError(400, 'Item instructions must be 300 characters or fewer');
      }
      itemIds.add(entry.menuItemId.toLowerCase());
    }

    const menuItems = await MenuItem.find({
      _id: { $in: [...itemIds] },
      restaurantId: restaurant._id,
      isAvailable: true,
    });
    const menuItemsById = new Map(menuItems.map((menuItem) => [String(menuItem._id).toLowerCase(), menuItem]));
    if (menuItemsById.size !== itemIds.size) {
      throw new ApiError(400, 'One or more menu items are no longer available');
    }

    const orderItems = items.map((entry) => {
      const menuItem = menuItemsById.get(entry.menuItemId.toLowerCase());
      return {
        menuItemId: menuItem._id,
        itemName: menuItem.name,
        unitPrice: menuItem.price,
        quantity: entry.quantity,
        itemInstructions: entry.itemInstructions || '',
        lineTotal: menuItem.price * entry.quantity,
      };
    });
    const subtotal = orderItems.reduce((total, entry) => total + entry.lineTotal, 0);
    const order = await Order.create({
      restaurantId: restaurant._id,
      tableId: table._id,
      orderReference: `KM-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      items: orderItems,
      subtotal,
      total: subtotal,
      specialInstructions: specialInstructions.trim(),
      status: 'PLACED',
      statusHistory: [{ status: 'PLACED', note: 'Order placed by guest' }],
    });

    req.app.get('io')?.to(`restaurant-${restaurant._id}`).emit('new-order', order);

    res.status(201).json({
      success: true,
      message: 'Order placed',
      data: {
        orderReference: order.orderReference,
        trackingToken: order.trackingToken,
        status: order.status,
        total: order.total,
      },
    });
  } catch (e) { next(e); }
};

const getItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ slug: req.params.restaurantSlug });
    if (!restaurant) throw new ApiError(404, 'Restaurant not found');
    
    const item = await MenuItem.findOne({ _id: req.params.itemId, restaurantId: restaurant._id });
    if (!item) throw new ApiError(404, 'Menu item not found');
    if (!item.isAvailable) throw new ApiError(404, 'Menu item not available');
    
    res.json({ success: true, data: item });
  } catch (e) { next(e); }
};

const getTableByQrToken = async (req, res, next) => {
  try {
    const table = await DiningTable.findOne({ qrToken: req.params.qrToken });
    if (!table) throw new ApiError(404, 'Table not found or inactive');
    if (!table.isActive) throw new ApiError(404, 'Table is currently inactive');
    
    const restaurant = await Restaurant.findById(table.restaurantId);
    if (!restaurant || restaurant.slug !== req.params.slug) {
      throw new ApiError(404, 'Table not found for this restaurant');
    }
    
    res.json({ success: true, data: table });
  } catch (e) { next(e); }
};

module.exports = { getBySlug, getMenu, getCategories, createPublicOrder, getItem, getTableByQrToken };