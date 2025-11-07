const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

function applySecurity(app) {
  // Helmet for basic security headers
  app.use(helmet());

  // Simple rate limiter
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 120, // limit each IP to 120 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // CORS: allow only trusted origins in production via ENV
  const allowed = (process.env.CORS_ALLOWED || '').split(',').map(s => s.trim()).filter(Boolean);
  if (allowed.length > 0) {
    app.use(cors({ origin: allowed }));
  } else {
    // default to allow all in development if not configured
    app.use(cors());
  }
}

module.exports = { applySecurity };
