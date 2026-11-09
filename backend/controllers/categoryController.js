const ApiError = require('../utils/ApiError');
const Category = require('../models/Category');

const list = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const [cats, total] = await Promise.all([
      Category.find({ restaurantId: req.restaurantId })
        .sort({ displayOrder: 1, createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Category.countDocuments({ restaurantId: req.restaurantId }),
    ]);

    res.json({
      success: true,
      data: cats,
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
    const { name, description, image, displayOrder, isActive } = req.body;
    if (!name) throw new ApiError(400, 'Name is required');
    const cat = await Category.create({ restaurantId: req.restaurantId, name, description, image, displayOrder: displayOrder || 0, isActive: isActive !== false });
    res.status(201).json({ success: true, data: cat });
  } catch (e) {
    if (e.code === 11000) return next(new ApiError(409, 'Category name already exists'));
    next(e);
  }
};

const update = async (req, res, next) => {
  try {
    const cat = await Category.findOneAndUpdate({ _id: req.params.categoryId, restaurantId: req.restaurantId }, req.body, { new: true, runValidators: true });
    if (!cat) throw new ApiError(404, 'Category not found');
    res.json({ success: true, data: cat });
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    const cat = await Category.findOneAndDelete({ _id: req.params.categoryId, restaurantId: req.restaurantId });
    if (!cat) throw new ApiError(404, 'Category not found');
    res.json({ success: true, message: 'Category deleted' });
  } catch (e) { next(e); }
};

module.exports = { list, create, update, remove };
