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
            {   timeout: 30_000, // 30s, if more timeout
                maxBuffer: 10 * 1024 * 1024 },  // 10MO max response (Default: 200ko)
                
                (error, stdout, stderr) => {

            if (stderr) {
                const lower = stderr.toLowerCase();
                if (lower.includes("sign in to confirm") || lower.includes("failed to decrypt") || lower.includes("could not copy")) {
                    return reject(new Error(`Unable to extract cookies from ${getUserBrowser()}. Please log in to this browser and try again.`));
                }
            }

            if (error) {
                logger.error(`YT-DLP Error: ${error.message}`);
                if (stderr) logger.debug(`stderr: ${stderr}`);
                return reject(new Error("Unable to fetch Info."));
            }

            if (!stdout) return reject(new Error("No Data Received."));

            try {
                const data = JSON.parse(stdout);
                resolve(data);
            } catch (e) {
                logger.error(`JSON Parsing Error: ${e.message}`);
                reject(new Error("JSON unreadable."));
            }
        });
    });
}

module.exports = { fetchInfo };
