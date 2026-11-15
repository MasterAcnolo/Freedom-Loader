const { ipcMain } = require("electron");
const {
    sendReport,
    checkReportService,
    getReportServiceStatus,
} = require("../sendReport");

function registerReportBugAPIHandlers() {
    ipcMain.handle("send-report", async (_, params) => {
        return await sendReport(params);
    });

    ipcMain.handle("get-report-service-status", async () => {
        await checkReportService();
        return getReportServiceStatus();
    });
}

module.exports = {
    registerReportBugAPIHandlers,
};
