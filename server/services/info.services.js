const { execFile } = require("child_process");
const { userYtDlp, denoPath } = require("../helpers/path");
const getUserBrowser = require("../helpers/getBrowser");
const { logger } = require("../logger");

function fetchInfo(url) {
    const args = [
        "--js-runtimes", `deno:${denoPath}`,
        "--dump-single-json",
        "--ignore-errors",
        "--yes-playlist",
        "--cookies-from-browser",`${getUserBrowser()}`,
        "--extractor-args","youtube:player_client=default",
        "--ignore-no-formats-error",
    ];

    return new Promise((resolve, reject) => {

        execFile(userYtDlp,[...args, url],
            {   timeout: 30_000, // 30s, si jamais plus, abandon de la requête
                maxBuffer: 10 * 1024 * 1024 },  // 10MO de réponse max (Par défaut: 200ko)
                
                (error, stdout, stderr) => {

            if (stderr) {
                const lower = stderr.toLowerCase();
                if (lower.includes("sign in to confirm") || lower.includes("failed to decrypt") || lower.includes("could not copy")) {
                    return reject(new Error(`Impossible d'extraire les cookies depuis ${getUserBrowser()}. Connectez-vous dans ce navigateur et réessayez.`));
                }
            }

            if (error) {
                logger.error(`Erreur yt-dlp: ${error.message}`);
                if (stderr) logger.debug(`stderr: ${stderr}`);
                return reject(new Error("Impossible de récupérer les infos."));
            }

            if (!stdout) return reject(new Error("Aucune donnée reçue."));

            try {
                const data = JSON.parse(stdout);
                resolve(data);
            } catch (e) {
                logger.error(`Erreur parsing JSON: ${e.message}`);
                reject(new Error("JSON illisible."));
            }
        });
    });
}

module.exports = { fetchInfo };
