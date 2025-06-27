const express = require("express");
const router = express.Router();
const { exec } = require("child_process");


router.post("/", (req, res) => {
    const options = {
      url: req.body.url,
      audioOnly: req.body.audioOnly === "1",  // coché mp3
      quality: req.body.quality || "best",   // par défaut best
      subtitles: req.body.subs === "1",      // imaginons un checkbox
      //FAUT RAJOUTER DES ARGUMENTS SOUS CETTE FORME
    };
  
    if (!options.url) {
      return res.status(400).send("❌ URL manquante !");
    }
  
    // construction progressive de la commmande
  
    // A SAVOIR QUE L'ON VA DISTINGUER DEUX TYPES D'ARGUMENTS SI j'AI BIEN COMPRIS, GENRE 
    // LES ARGUMENTS OBLIGATOIRES ET LES ARGUMENTS FALCUTATIFS
    // GENRE LES SOUS TITRE OU L'AUDIO ONLY QUI SONT NON ESSENTIEL
  
    let command = `yt-dlp`;
  
    if (options.audioOnly) {
      command += " --extract-audio --audio-format mp3"; // AJOUT DE l'ONLY AUDIO SI JAMAIS ON LE CHECK, SINON CA PREND LA VALEUR PAR DEFAUT A SAVOIR VIDEO
    }
  
    if (options.subtitles) {
      command += " --write-subs --sub-lang en"; 
    }
  
      command += ` -f ${options.quality}`; //QUALITE DU TELECHARGEMENT
      command += ` -o "downloads/%(title)s.%(ext)s"`; // DOSSIER DE SORTIE 
      command += ` "${options.url}"`; // L'URL DE BASE
  
      // ON COOK LA COMMANDE FINALE ICI: 
    console.log("🔧 Commande finale :", command);
  
    exec(command, (error, stdout, stderr) => { // Error = Erreur Node JS || stdout = sortie de la commande du terminal || STDerr c'est les erreurs interne au terminal
      if (error) {
        console.error("Erreur yt-dlp :", stderr || error.message);
        return res.status(500).send("❌ Erreur pendant le téléchargement.");
      }
  
      console.log("yt-dlp terminé :", stdout);
      res.send("✅ Téléchargement terminé !");
    });
});


module.exports = router;