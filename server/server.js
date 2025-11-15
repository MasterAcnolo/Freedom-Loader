const express = require("express");
const fs = require("fs");
const path = require("path");
const { logger, logSessionStart, logSessionEnd } = require("./logger");
const config = require("../config");
const { execFile } = require("child_process");
const { userYtDlp } = require("./helpers/path");


const {ffmpegPath, denoPath} = require("./helpers/path")

const app = express();

console.log("ffmpegPath:", ffmpegPath);
console.log("denoPath:", denoPath);

app.use(express.json());

// Dossier de téléchargement
const outputFolder = path.join(process.env.USERPROFILE, "Downloads", "Freedom Loader");

// Création du dossier si nécessaire
try {
  fs.mkdirSync(outputFolder, { recursive: true });
  logger.info(`Dossier Freedom Loader prêt dans ${outputFolder}`);
} catch (err) {
  logger.error("Impossible de créer le dossier :", err);
  process.exit(1);
}

// Mise à jour yt-dlp au 
execFile(userYtDlp, ["-U"], (err, stdout, stderr) => {
  if (err) logger.warn("Erreur update yt-dlp:", err);
  else logger.info(`Update yt-dlp : ${stdout}`);
});

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/download", require("./routes/download.route"));
app.use("/info", require("./routes/info.route"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Fonction pour démarrer le serveur
async function startServer() {
  return new Promise((resolve, reject) => {
    const server = app.listen(config.applicationPort, () => {
      logger.info(`Serveur Express prêt sur http://localhost:${config.applicationPort}`);
      resolve(server);
    });

    server.on("error", (err) => {
      logger.error("Erreur serveur Express :", err);
      reject(err);
    });

    const gracefulExit = () => {
      logSessionEnd();
      server.close(() => {
        logger.info("Serveur Express fermé proprement.");
        process.exit();
      });
    };

    process.on("SIGINT", gracefulExit);
    process.on("SIGTERM", gracefulExit);
  });
}

module.exports = { startServer };