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

app.post("/download", (req, res) => {

  const videoUrl = req.body.url;

  if (!videoUrl) {
    return res.status(400).send("❌ URL manquante !");
  }

  const safeUrl = `"${videoUrl.replace(/"/g, '\\"')}"`;

  const command = `yt-dlp -o "downloads/%(title)s.%(ext)s" ${safeUrl}`;

  console.log("▶️ Commande yt-dlp exécutée :", command);

  exec(command, (error, stdout, stderr) => {
    console.log("=== SORTIE ===");
    console.log(stdout);

    console.log("=== STDERR ===");
    console.error(stderr);

    if (error) {
      console.error("=== ERREUR ===");
      console.error(error);
      return res.status(500).send(`❌ Erreur yt-dlp : ${stderr || error.message}`);
    }

    res.send("✅ Téléchargement lancé !");
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🟢 Serveur prêt : http://localhost:${PORT}`);
});
