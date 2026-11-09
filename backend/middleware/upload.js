const multer = require('multer');
const path = require('path');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === 'production';
const uploadDir = isProduction
  ? '/tmp/uploads'
  : path.join(__dirname, '..', 'uploads');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch {
  // In strict serverless environments (e.g. Vercel read-only filesystem),
  // fall back to the writable /tmp directory at runtime.
  const fallbackDir = isProduction ? '/tmp/uploads' : uploadDir;
  try {
    fs.mkdirSync(fallbackDir, { recursive: true });
  } catch {
    // If the fallback also fails, Multer will receive the path as-is and
    // fail per-upload with a clear error instead of crashing startup.
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 3 * 1024 * 1024 } });

module.exports = upload;
