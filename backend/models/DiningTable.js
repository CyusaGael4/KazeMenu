const mongoose = require('mongoose');
const crypto = require('crypto');

const diningTableSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    tableName: { type: String, required: true, trim: true, maxlength: 80 },
    tableNumber: { type: String, required: true, trim: true },
    qrToken: { type: String, required: true, default: () => crypto.randomBytes(24).toString('hex') },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

diningTableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });
diningTableSchema.index({ qrToken: 1 });

module.exports = mongoose.model('DiningTable', diningTableSchema);
