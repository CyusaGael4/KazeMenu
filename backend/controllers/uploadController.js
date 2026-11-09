const ApiError = require('../utils/ApiError');

const uploadImage = (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, 'No image uploaded');
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({ success: true, message: 'Upload successful', data: { url, filename: req.file.filename } });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadImage };
