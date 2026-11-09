const express = require('express');
const { getMe, updateMe } = require('../controllers/restaurantController');
const { requireAuth, resolveTenant } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(requireAuth, resolveTenant, apiLimiter);
router.get('/me', getMe);
router.put('/me', updateMe);

module.exports = router;
