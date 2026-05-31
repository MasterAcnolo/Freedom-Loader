const express = require("express");
const path = require("path");
const { logger, logSessionEnd } = require("./logger");
const config = require("../config");
const { rateLimit } = require("./helpers/rateLimit.helpers");

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/download", require("./routes/download.route"));
app.use("/info",     require("./routes/info.route"));
app.get("/", rateLimit, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

/**
 * Initializes and starts the Express HTTP server.
 * 
 * - Binds the server to `config.applicationPort`
 * - Resolves with the HTTP server instance on successful startup
 * - Rejects on server binding or runtime errors
 * - Registers SIGINT/SIGTERM handlers for graceful shutdown
 */
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

    /**
     * Clean exit function
     *  - Stop Log 
     *  - Stop Express Server
     *  - Stop Electron App 
     */
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