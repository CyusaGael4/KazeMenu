const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, trim: true, default: '' },
    logo: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    restaurantType: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    currency: { type: String, enum: ['RWF'], default: 'RWF' },
    accentColor: { type: String, trim: true, default: '#FF633D' },
    isActive: { type: Boolean, default: false },
    termsAcceptedAt: { type: Date, default: null },
    privacyAcceptedAt: { type: Date, default: null },
    onboardingStep: { type: Number, default: 0, min: 0, max: 5 },
    openingHours: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
restaurantSchema.index({ slug: 1 }, { unique: true });
restaurantSchema.index({ isActive: 1 });
