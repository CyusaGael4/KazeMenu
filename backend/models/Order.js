const mongoose = require('mongoose');
const crypto = require('crypto');

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    itemName: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    itemInstructions: { type: String, trim: true, default: '' },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'DiningTable', required: true },
    orderReference: { type: String, required: true, unique: true },
    trackingToken: { type: String, required: true, default: () => crypto.randomBytes(32).toString('hex') },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    specialInstructions: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'],
      default: 'PLACED',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        at: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
    cancellationReason: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

orderSchema.index({ restaurantId: 1, status: 1, createdAt: -1 });
orderSchema.index({ trackingToken: 1 });
orderSchema.index({ tableId: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
