const fs = require("fs");
const path = require("path");
const {logger, logDir} = require("../server/logger");

const REPORT_URL = "https://freedom-loader-report.acnolo.fr";
const REPORT_SERVICE_TIMEOUT_MS = 5000;
let reportServiceStatus = {
    status: "checking",
    message: "Checking bug report service..."
};
let reportServiceCheck = null;

async function checkReportService() {
    if (reportServiceCheck) {
        return reportServiceCheck;
    }

    reportServiceCheck = (async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REPORT_SERVICE_TIMEOUT_MS);

        try {
            const response = await fetch(REPORT_URL, {
                method: "GET",
                signal: controller.signal
            });

            if (response.status >= 500) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            reportServiceStatus = {
                status: "online",
                message: "Bug report service is available."
            };
            logger.info(`Bug report service is reachable (status ${response.status}).`);
        } catch (err) {
            reportServiceStatus = {
                status: "offline",
                message: "Bug report service is unavailable. Reports may fail to send."
            };
            logger.warn(`Bug report service is unreachable: ${err.message}`);
        } finally {
            clearTimeout(timeout);
        }

        return reportServiceStatus;
    })();

    return reportServiceCheck;
}

function getReportServiceStatus() {
    return reportServiceStatus;
}

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
            const now = new Date();
            const today = [
                now.getFullYear(),
                String(now.getMonth() + 1).padStart(2, "0"),
                String(now.getDate()).padStart(2, "0")
            ].join("-");

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

        const response = await fetch(REPORT_URL, {
            method: "POST",
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

module.exports = {sendReport, checkReportService, getReportServiceStatus};