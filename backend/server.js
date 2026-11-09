require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const Membership = require('./models/Membership');
const { verifyToken } = require('./utils/jwt');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter, authLimiter, publicOrderLimiter, uploadLimiter } = require('./middleware/rateLimiter');
const { requestTimeout } = require('./middleware/timeout');
const { cacheMiddleware } = require('./middleware/cache');
const { sanitizeInput } = require('./middleware/sanitize');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie || '';
    const tokenCookie = cookieHeader.split(';').map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith('kazemenu_token='));
    if (!tokenCookie) return next(new Error('Authentication required'));

    const token = decodeURIComponent(tokenCookie.slice('kazemenu_token='.length));
    const payload = verifyToken(token);
    const restaurantId = socket.handshake.query.restaurantId;
    if (typeof restaurantId !== 'string' || !mongoose.isValidObjectId(restaurantId)) {
      return next(new Error('Invalid restaurant'));
    }

    const membership = await Membership.findOne({
      userId: payload.sub,
      restaurantId,
    });
    if (!membership) return next(new Error('Restaurant access denied'));

    socket.data.restaurantId = restaurantId;
    next();
  } catch {
    next(new Error('Authentication failed'));
  }
});

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Security headers via Helmet
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    imgSrc: ["'self'", 'data:', 'https:'],
    scriptSrc: ["'self'"],
    connectSrc: ["'self'", process.env.VITE_API_URL || 'http://localhost:5000'],
  },
}));
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-restaurant-id', 'x-tracking-token'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Request timeout middleware - 30 seconds default
app.use(requestTimeout(30000));

// Input sanitization for XSS protection
app.use(sanitizeInput);

// Cache middleware for GET requests (60 second TTL)
app.use(cacheMiddleware(60));

// Basic CSRF mitigation: validate Origin on unsafe methods
app.use('/api', (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const origin = req.headers.origin;
    if (origin && !allowedOrigins.includes(origin)) {
      return res.status(403).json({ success: false, message: 'Invalid origin' });
    }
  }
  next();
});

// Rate limiting - apply different limits based on route
app.use('/api/auth', authLimiter);              // Stricter for auth
app.use('/api/uploads', uploadLimiter);         // Stricter for uploads
app.use('/api/public/restaurants', publicOrderLimiter); // Stricter for public orders
app.use('/api', apiLimiter);                    // General API limit

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'KazeMenu API healthy',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/restaurant', require('./routes/restaurantRoutes'));
app.use('/api/public/restaurants', require('./routes/publicRestaurantRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/menu/categories', require('./routes/categoryRoutes'));
app.use('/api/menu/items', require('./routes/menuItemRoutes'));
app.use('/api/tables', require('./routes/tableRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`KazeMenu backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

// Socket.IO - Restaurant-specific rooms and order events
io.on('connection', (socket) => {
  socket.join(`restaurant-${socket.data.restaurantId}`);
});

// Export io for use in other modules
app.set('io', io);

module.exports = { app, server, io };
