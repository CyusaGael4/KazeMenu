const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    role: { type: String, enum: ['owner', 'manager', 'staff'], default: 'owner' },
  },
  { timestamps: true }
);

membershipSchema.index({ userId: 1, restaurantId: 1 }, { unique: true });
membershipSchema.index({ restaurantId: 1 });

module.exports = mongoose.model('Membership', membershipSchema);
