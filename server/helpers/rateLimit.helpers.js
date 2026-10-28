const RateLimit = require("express-rate-limit");

/**
 * Rate limiter middleware used to protect public endpoints
 * against abusive or excessive requests.
 *
 * Restrictions:
 * - 5 requests per IP address
 * - 15-minute sliding window
 *
 * When the limit is exceeded, a HTTP 429 (Too Many Requests)
 * response is returned.
 */
const rateLimit = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {error: {code: "RATE_LIMITED", message: "Too many requests, please try again later."}},
  standardHeaders: true,
  legacyHeaders: false,
});

const downloadRateLimit = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {error: {code: "RATE_LIMITED", message: "Too many download requests, please try again later."}},
  standardHeaders: true,
  legacyHeaders: false,
});

const infoRateLimit = RateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: {error: {code: "RATE_LIMITED", message: "Too many info requests, please try again later."}},
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  rateLimit,
  downloadRateLimit,
  infoRateLimit,
};