const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, default: '' },
    image: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ restaurantId: 1, name: 1 }, { unique: true });
categorySchema.index({ restaurantId: 1, displayOrder: 1 });

module.exports = mongoose.model('Category', categorySchema);
