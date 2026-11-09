const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const Membership = require('../models/Membership');

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.kazemenu_token;
    if (!token) throw new ApiError(401, 'Authentication required');

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user) throw new ApiError(401, 'Invalid session');

    const memberships = await Membership.find({ userId: user._id });
    req.user = user;
    req.memberships = memberships;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Invalid or expired session'));
    }
    next(err);
  }
};

const resolveTenant = (req, res, next) => {
  try {
    const requested = req.headers['x-restaurant-id'];
    let membership = null;
    if (requested) {
      membership = req.memberships.find((m) => String(m.restaurantId) === String(requested));
    } else if (req.memberships.length > 0) {
      membership = req.memberships[0];
    }
    if (!membership) {
      throw new ApiError(403, 'No restaurant access');
    }
    req.membership = membership;
    req.restaurantId = membership.restaurantId;
    req.userRole = membership.role;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireAuth, resolveTenant };
