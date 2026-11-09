const ApiError = require('../utils/ApiError');
const Restaurant = require('../models/Restaurant');

const allowedFields = [
  'name',
  'description',
  'restaurantType',
  'location',
  'phone',
  'email',
  'accentColor',
  'coverImage',
  'logo',
  'openingHours',
  'isActive',
  'onboardingStep',
];

const getMe = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.restaurantId);
    if (!restaurant) throw new ApiError(404, 'Restaurant not found');
    restaurant.currency = 'RWF';
    res.status(200).json({ success: true, data: restaurant });
  } catch (err) {
    next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const updates = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }
    updates.currency = 'RWF';
    if (req.body.isActive === true) {
      if (req.body.acceptTerms !== true || req.body.acceptPrivacy !== true) {
        throw new ApiError(400, 'Accept the Terms & Conditions and Privacy Policy before activating ordering');
      }
      const acceptedAt = new Date();
      updates.termsAcceptedAt = acceptedAt;
      updates.privacyAcceptedAt = acceptedAt;
    }
    // handle slug regeneration if name changed? keep simple; slug immutable here
    const restaurant = await Restaurant.findByIdAndUpdate(req.restaurantId, updates, {
      new: true,
      runValidators: true,
    });
    if (!restaurant) throw new ApiError(404, 'Restaurant not found');
    res.status(200).json({ success: true, message: 'Restaurant updated', data: restaurant });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateMe };
