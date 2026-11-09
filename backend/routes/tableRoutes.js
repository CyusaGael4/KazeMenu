const express = require('express');
const { list, create, update, remove, status } = require('../controllers/tableController');
const { requireAuth, resolveTenant } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(requireAuth, resolveTenant, apiLimiter);
router.get('/', list);
router.post('/', create);
router.put('/:tableId', update);
router.delete('/:tableId', remove);
router.patch('/:tableId/status', status);

module.exports = router;
