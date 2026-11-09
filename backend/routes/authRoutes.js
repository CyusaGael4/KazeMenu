const express = require('express');
const { body } = require('express-validator');
const { register, login, logout, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('restaurantName').trim().isLength({ min: 1, max: 120 }).withMessage('Restaurant name is required'),
    body('phone').trim().isLength({ min: 7, max: 30 }).withMessage('Valid phone number is required'),
    body('acceptTerms').custom((value) => value === true).withMessage('Terms & Conditions must be accepted'),
    body('acceptPrivacy').custom((value) => value === true).withMessage('Privacy Policy must be accepted'),
  ],
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);

module.exports = router;
