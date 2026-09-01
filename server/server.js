const express = require("express");
const path = require("path");
const config = require("../config");

const { logger, logSessionEnd } = require("./logger");
const { rateLimit } = require("./helpers/rateLimit.helpers");

const app = express();

/**
 * Store the state of the server
 */
let serverInstance = null;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/download", require("./routes/download.route"));
app.use("/info", require("./routes/info.route"));

// Interface
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
    const serverInstance = app.listen(config.applicationPort, () => {
      logger.info(`Express server ready at http://localhost:${config.applicationPort}`);
      resolve(serverInstance);
    });

    serverInstance.on("error", (err) => {
      logger.error("Express server error:", err);
      reject(err);
    });
  });
}

/**
 * Clean exit function called by Electron
 */
function stopServer() {
  if (serverInstance) {
    try{
      serverInstance.close();
      logger.info("Express server closed cleanly");
    } catch (err){
      logger.error("Express server was not closed cleanly:", err)
    }
  } else {
    logger.info("Express server was already closed");
  }
}

module.exports = { startServer, stopServer };