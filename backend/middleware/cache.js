/**
 * Simple in-memory cache for GET requests
 * Caches responses for 60 seconds to reduce database load
 */
const cache = new Map();

const cacheMiddleware = (ttlSeconds = 60) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttlSeconds * 1000) {
      return res.json(cached.data);
    }

    // Intercept res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = function (data) {
      cache.set(key, {
        data,
        timestamp: Date.now(),
      });
      // Clean up old cache entries periodically
      if (cache.size > 500) {
        const now = Date.now();
        for (const [k, v] of cache.entries()) {
          if (now - v.timestamp > ttlSeconds * 1000) {
            cache.delete(k);
          }
        }
      }
      return originalJson(data);
    };

    next();
  };
};

module.exports = { cacheMiddleware, cache };

/**
 * Clear cache entries for a pattern (e.g., after data mutation)
 */
const clearCache = (pattern) => {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

module.exports = { cacheMiddleware, cache, clearCache };