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

const express = require("express");
const router = express.Router();
const { execFile } = require("child_process");
const path = require("path");

const ytDlpPath = path.join(__dirname, "../../yt-dlp.exe");

router.post("/", (req, res) => {
  const url = req.body.url;
  if (!url) return res.status(400).send("❌ URL manquante");

  execFile(ytDlpPath, ["--dump-json", url], (error, stdout, stderr) => {
    if (error) {
      console.error("Erreur lors de l'exécution de yt-dlp :", error);
      console.error("stderr :", stderr);
      return res.status(500).send("❌ Impossible de récupérer les infos.");
    }

    try {
      const info = JSON.parse(stdout);
      res.json(info);
    } catch (e) {
      console.error("Erreur lors du parsing JSON :", e);
      res.status(500).send("❌ JSON illisible.");
    }
  });
});

module.exports = router;
