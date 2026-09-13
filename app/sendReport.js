const fs = require("fs");
const path = require("path");
const {logger, logDir} = require("../server/logger");

async function sendReport(params) {
    try {
        const {title, description, includeLogs} = params;

        if (!title || !description) {
            throw new Error("Title and description are required.");
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("context", description);

        if (includeLogs === "yes" && logDir) {
            // YYYY-MM-DD
            const today = new Date().toISOString().split("T")[0];

            const logFilePath = path.join(logDir, `LOGS-${today}.log`);

            if (fs.existsSync(logFilePath)) {
                const logFileContent = fs.readFileSync(logFilePath);
                const blob = new Blob([logFileContent], {type: "text/plain"});
                formData.append("file", blob, `LOGS-${today}.log`);
                logger.info("Logs attached to bug report.");
            } else {
                logger.warn(`Log file not found for today: ${logFilePath}`);
            }
        }

        const response = await fetch(process.env.BUG_REPORT_URL, {
            method: "POST",
            headers: {
                "X-Api-Key": process.env.BUG_REPORT_API_KEY
            },
            body: formData
        });

        if (!response.ok) {
            logger.error(`Server returned an error: ${response.status}`);
            throw new Error(`Server responded with status ${response.status}`);
        }

        logger.info("Bug report successfully sent.");
        return true;
    } catch (err) {
        logger.error(`Failed to send bug report: ${err.message}`);
        throw err;
    }
}

module.exports = {sendReport};