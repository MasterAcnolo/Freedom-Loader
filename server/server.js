const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const downloadDir = path.join(__dirname, "downloads");
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir);
}

const allowedFormats = ["best", "mp3", "mp4"];

app.post("/download", (req, res) => {
  const videoUrl = req.body.url;
  let format = req.body.format || "best";

  if (!videoUrl) {
    return res.status(400).send("❌ Il faut envoyer une URL !");
  }

  if (!allowedFormats.includes(format)) {
    format = "best"; 
  }

  const safeUrl = `"${videoUrl.replace(/"/g, '\\"')}"`;

  let command = "";

  if (format === "mp3") {
    command = `yt-dlp --extract-audio --audio-format mp3 -o "downloads/%(title)s.%(ext)s" ${safeUrl}`;
  } else {
    command = `yt-dlp -f ${format} -o "downloads/%(title)s.%(ext)s" ${safeUrl}`;
  }

  console.log("▶️ Commande exécutée :", command);

  exec(command, (error, stdout, stderr) => {
    if (stdout) console.log("=== SORTIE ===", stdout);
    if (stderr) console.error("=== STDERR ===", stderr);

    if (error) {
      console.error("=== ERREUR ===", error);
      return res.status(500).send(`❌ Problème pendant le téléchargement : ${stderr || error.message}`);
    }

    res.send("✅ Téléchargement lancé !");
  });
});

app.get("/downloads", (req, res) => {
  fs.readdir(downloadDir, (err, files) => {
    if (err) {
      return res.status(500).send("Erreur de lecture du dossier");
    }
    res.json(files);
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🟢 Serveur prêt : http://localhost:${PORT}`);
});
