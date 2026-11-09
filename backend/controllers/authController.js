const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');
const { signToken } = require('../utils/jwt');
const { setAuthCookie, clearAuthCookie } = require('../utils/cookies');
const { uniqueSlug } = require('../utils/slugify');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const connectDB = require('../config/db');

const getMembershipModel = () => require('../models/Membership');

const handleValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array().map((e) => e.msg).join(', '));
  }
};

const register = async (req, res, next) => {
  try {
    handleValidation(req);
    const { email, password, restaurantName, phone, acceptTerms, acceptPrivacy } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new ApiError(409, 'Email already registered');

    if (acceptTerms !== true || acceptPrivacy !== true) {
      throw new ApiError(400, 'Accept the Terms & Conditions and Privacy Policy to create an account');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ fullName: restaurantName, email, passwordHash });

    const slug = await uniqueSlug(Restaurant, restaurantName);
    const restaurant = await Restaurant.create({
      name: restaurantName,
      phone,
      email,
      slug,
      isActive: true,
      onboardingStep: 5,
      termsAcceptedAt: new Date(),
      privacyAcceptedAt: new Date(),
    });

    await connectDB.getDbReady();
    await getMembershipModel().create({ userId: user._id, restaurantId: restaurant._id, role: 'owner' });

    const token = signToken(user._id);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: { id: user._id, fullName: user.fullName, email: user.email },
        restaurant: { id: restaurant._id, name: restaurant.name, slug: restaurant.slug },
      },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    handleValidation(req);
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) throw new ApiError(401, 'Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new ApiError(401, 'Invalid credentials');

    await connectDB.getDbReady();
    const memberships = await getMembershipModel().find({ userId: user._id });
    const token = signToken(user._id);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user._id, fullName: user.fullName, email: user.email },
        memberships: memberships.map((m) => ({ restaurantId: m.restaurantId, role: m.role })),
      },
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);
    res.status(200).json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    await connectDB.getDbReady();
    const memberships = await getMembershipModel().find({ userId: req.user._id });
    res.status(200).json({
      success: true,
      data: {
        user: { id: req.user._id, fullName: req.user.fullName, email: req.user.email },
        memberships: memberships.map((m) => ({ restaurantId: m.restaurantId, role: m.role })),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, me };
