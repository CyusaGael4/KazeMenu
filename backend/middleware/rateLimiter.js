const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter - 300 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

/**
 * Strict rate limiter for authentication endpoints - 10 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later' },
});

/**
 * Public order creation rate limiter - 30 requests per 15 minutes per IP
 */
const publicOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many orders placed, please try again later' },
});

/**
 * Upload rate limiter - 20 requests per 15 minutes per IP
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many upload attempts, please try again later' },
});

module.exports = { apiLimiter, authLimiter, publicOrderLimiter, uploadLimiter };
  
