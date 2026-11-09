const express = require('express');
const { list, create, update, remove } = require('../controllers/categoryController');
const { requireAuth, resolveTenant } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(requireAuth, resolveTenant, apiLimiter);
router.get('/', list);
router.post('/', create);
router.put('/:categoryId', update);
router.delete('/:categoryId', remove);

module.exports = router;
