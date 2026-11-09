/**
 * Request timeout middleware
 * Ensures requests don't hang indefinitely
 */
const requestTimeout = (ms = 30000) => {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          message: 'Request timed out',
        });
      }
    }, ms);

    // Clear timer when response is sent
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
};

module.exports = { requestTimeout };