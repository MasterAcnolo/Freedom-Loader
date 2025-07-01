/*
  This file is part of Freedom Loader.

  Copyright (C) 2025 MasterAcnolo

  Freedom Loader is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License.

  Freedom Loader is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const express = require("express");        // importe Express
const router = express.Router();           // crée un routeur Express indépendant
const { execFile } = require("child_process"); // permet d’exécuter un programme externe
const path = require("path");              // module pour gérer les chemins de fichiers

// chemin vers le binaire yt-dlp embarqué
const ytDlpPath = path.join(__dirname, "../../yt-dlp.exe");

// route POST sur la racine de ce routeur
router.post("/", (req, res) => {
  const url = req.body.url;                // récupère l'URL depuis la requête POST
  if (!url) return res.status(400).send("❌ URL manquante"); // validation simple

  // exécute yt-dlp avec --dump-json pour récupérer les métadonnées de la vidéo
  execFile(ytDlpPath, ["--dump-json", url], (error, stdout, stderr) => {
    if (error) {
      // gestion d’erreur : par exemple yt-dlp plante ou l’URL est invalide
      console.error("Erreur lors de l'exécution de yt-dlp :", error);
      console.error("stderr :", stderr);
      return res.status(500).send("❌ Impossible de récupérer les infos.");
    }

    try {
      // on parse le JSON envoyé par yt-dlp
      const info = JSON.parse(stdout);
      // on renvoie l’objet JSON directement au frontend
      res.json(info);
    } catch (e) {
      // le JSON est mal formé
      console.error("Erreur lors du parsing JSON :", e);
      res.status(500).send("❌ JSON illisible.");
    }
  });
});

// on exporte le routeur pour être utilisé dans app.js ou ailleurs
module.exports = router;
