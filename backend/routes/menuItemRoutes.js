const express = require('express');
const { list, create, update, remove, availability } = require('../controllers/menuItemController');
const { requireAuth, resolveTenant } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(requireAuth, resolveTenant, apiLimiter);
router.get('/', list);
router.post('/', create);
router.put('/:itemId', update);
router.delete('/:itemId', remove);
router.patch('/:itemId/availability', availability);

module.exports = router;
