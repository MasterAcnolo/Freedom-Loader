const express = require("express");
const { exec } = require("child_process"); // Requis pour écrire dans un terminal
const fs = require("fs");

const app = express();

const infoRoute = require("./routes/info");
const downloadRoute = require("./routes/download");

app.use(express.urlencoded({ extended: true })); // Pour pouvoir recevoir plein de truc

if (!fs.existsSync("downloads")) { // Si jamais il n'y a pas de dossier downloads
  fs.mkdirSync("downloads"); // On le crée
}

app.use(express.static("public")); // Ca c'est pour ouvrir le serveur, comme ça plus besoin d'utiliser live server


// route pour le formulaire de téléchargement
app.use("/download", downloadRoute); // on associe le contenu de infos.js à /download
// route pour l'info
app.use("/info", infoRoute); // on associe le contenu de infos.js à /info


app.listen(8080, () => {
  console.log("🟢 Serveur prêt sur http://localhost:8080");
});
