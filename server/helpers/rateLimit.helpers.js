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
  message: "Too many requests, please try again later.",
  statusCode: 429,
});

module.exports = {
    rateLimit
}