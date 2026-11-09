const ApiError = require('../utils/ApiError');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');

const list = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter = { restaurantId: req.restaurantId };
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

const create = async (req, res, next) => {
  try {
    const { categoryId, name, description, price, image, isAvailable } = req.body;
    if (!categoryId || !name || price === undefined) throw new ApiError(400, 'categoryId, name and price are required');
    const cat = await Category.findOne({ _id: categoryId, restaurantId: req.restaurantId });
    if (!cat) throw new ApiError(400, 'Invalid category');
    const item = await MenuItem.create({ restaurantId: req.restaurantId, categoryId, name, description, price, image, isAvailable: isAvailable !== false });
    res.status(201).json({ success: true, data: item });
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    if (req.body.categoryId) {
      const cat = await Category.findOne({ _id: req.body.categoryId, restaurantId: req.restaurantId });
      if (!cat) throw new ApiError(400, 'Invalid category');
    }
    const item = await MenuItem.findOneAndUpdate({ _id: req.params.itemId, restaurantId: req.restaurantId }, req.body, { new: true, runValidators: true });
    if (!item) throw new ApiError(404, 'Menu item not found');
    res.json({ success: true, data: item });
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    const item = await MenuItem.findOneAndDelete({ _id: req.params.itemId, restaurantId: req.restaurantId });
    if (!item) throw new ApiError(404, 'Menu item not found');
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (e) { next(e); }
};

const availability = async (req, res, next) => {
  try {
    const item = await MenuItem.findOneAndUpdate({ _id: req.params.itemId, restaurantId: req.restaurantId }, { isAvailable: req.body.isAvailable }, { new: true });
    if (!item) throw new ApiError(404, 'Menu item not found');
    res.json({ success: true, data: item });
  } catch (e) { next(e); }
};

module.exports = { list, create, update, remove, availability };
