const ApiError = require('../utils/ApiError');
const DiningTable = require('../models/DiningTable');

const list = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const [tables, total] = await Promise.all([
      DiningTable.find({ restaurantId: req.restaurantId })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DiningTable.countDocuments({ restaurantId: req.restaurantId }),
    ]);

    res.json({
      success: true,
      data: tables,
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
    const { tableName, tableNumber, isActive } = req.body;
    if (!tableName || !tableNumber) throw new ApiError(400, 'tableName and tableNumber are required');
    const table = await DiningTable.create({ restaurantId: req.restaurantId, tableName, tableNumber, isActive: isActive !== false });
    res.status(201).json({ success: true, data: table });
  } catch (e) {
    if (e.code === 11000) return next(new ApiError(409, 'Table number already exists'));
    next(e);
  }
};

const update = async (req, res, next) => {
  try {
    const table = await DiningTable.findOneAndUpdate({ _id: req.params.tableId, restaurantId: req.restaurantId }, req.body, { new: true, runValidators: true });
    if (!table) throw new ApiError(404, 'Table not found');
    res.json({ success: true, data: table });
  } catch (e) {
    if (e.code === 11000) return next(new ApiError(409, 'Table number already exists'));
    next(e);
  }
};

const remove = async (req, res, next) => {
  try {
    const table = await DiningTable.findOneAndDelete({ _id: req.params.tableId, restaurantId: req.restaurantId });
    if (!table) throw new ApiError(404, 'Table not found');
    res.json({ success: true, message: 'Table deleted' });
  } catch (e) { next(e); }
};

const status = async (req, res, next) => {
  try {
    const table = await DiningTable.findOneAndUpdate({ _id: req.params.tableId, restaurantId: req.restaurantId }, { isActive: req.body.isActive }, { new: true });
    if (!table) throw new ApiError(404, 'Table not found');
    res.json({ success: true, data: table });
  } catch (e) { next(e); }
};

module.exports = { list, create, update, remove, status };
