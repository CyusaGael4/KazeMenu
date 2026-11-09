const express = require('express');
const upload = require('../middleware/upload');
const { uploadImage } = require('../controllers/uploadController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);
router.post('/', upload.single('image'), uploadImage);

module.exports = router;
