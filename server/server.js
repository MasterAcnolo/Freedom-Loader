const express = require("express");
const path = require("path");
const { logger, logSessionEnd } = require("./logger");
const config = require("../config");
const { rateLimite } = require("./helpers/rateLimit.helpers");

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/download", require("./routes/download.route"));
app.use("/info",     require("./routes/info.route"));
app.get("/", rateLimite, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

async function startServer() {
  return new Promise((resolve, reject) => {
    const server = app.listen(config.applicationPort, () => {
      logger.info(`Express server ready at http://localhost:${config.applicationPort}`);
      resolve(server);
    });

    server.on("error", (err) => {
      logger.error("Express server error:", err);
      reject(err);
    });

    const gracefulExit = () => {
      logSessionEnd();
      server.close(() => {
        logger.info("Express server closed cleanly.");
        process.exit();
      });
    };

    process.on("SIGINT",  gracefulExit);
    process.on("SIGTERM", gracefulExit);
  });
}

module.exports = { startServer };