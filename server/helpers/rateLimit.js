const RateLimit = require("express-rate-limit");


/* Rate Limite */
const rateLimite = RateLimit({
  windowMs: 15 * 60, // 15 minutes
  max: 5, // limit each IP to 100 requests per windowMs on the root path
  message: "Too many requests, please try again later.",
  statusCode: 429, // HTTP status code for "Too Many Requests"
});

module.exports = {
    rateLimite
}