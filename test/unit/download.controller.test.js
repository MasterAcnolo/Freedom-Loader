jest.mock("../../server/services/download.services", () => ({
    fetchDownload: jest.fn(),
    cancelDownload: jest.fn(),
}));
jest.mock("../../server/logger", () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));
jest.mock("../../server/helpers/validation.helpers", () => ({
    isValidUrl: jest.fn(),
    isSafePath: jest.fn(),
}));
jest.mock("../../server/helpers/notify.helpers", () => ({
    notifyDownloadFinished: jest.fn(),
}));
jest.mock("../../config", () => ({
    configFeatures: {
        notifySystem: true,
    },
}));

const {fetchDownload, cancelDownload} = require("../../server/services/download.services");
const {logger} = require("../../server/logger");
const {isValidUrl, isSafePath} = require("../../server/helpers/validation.helpers");
const {notifyDownloadFinished} = require("../../server/helpers/notify.helpers");
const {
    downloadController,
    cancelDownloadController,
    progressController,
    speedController,
    stageController,
    playlistInfoController,
} = require("../../server/controller/download.controller");

describe("download.controller", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {body: {}, on: jest.fn()};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            write: jest.fn().mockReturnThis(),
            flushHeaders: jest.fn(),
            end: jest.fn(),
        };
    });

    describe("downloadController", () => {
        test("returns 400 for invalid url", async () => {
            isValidUrl.mockReturnValue(false);
            req.body.url = "bad-url";
            await downloadController(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: {code: "INVALID_URL", message: "Invalid URL"},
            });
        });

        test("returns 400 for unsafe path", async () => {
            isValidUrl.mockReturnValue(true);
            isSafePath.mockReturnValue(false);
            req.body.url = "https://youtube.com/watch?v=123";
            req.body.savePath = "C:\\Windows\\System32";
            await downloadController(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: {code: "INVALID_PATH", message: "Save path not allowed"},
            });
            expect(logger.warn).toHaveBeenCalled();
        });

        test("starts download and returns success", async () => {
            isValidUrl.mockReturnValue(true);
            isSafePath.mockReturnValue(true);
            req.body = {
                url: "https://youtube.com/watch?v=123",
                audioOnly: "1",
                quality: "720",
                savePath: "/home/user/Downloads",
                playlistTitle: "My Playlist",
            };
            fetchDownload.mockResolvedValue("/home/user/Downloads");
            await downloadController(req, res);
            expect(fetchDownload).toHaveBeenCalled();
            const callArgs = fetchDownload.mock.calls[0][0];
            expect(callArgs.url).toBe("https://youtube.com/watch?v=123");
            expect(callArgs.audioOnly).toBe(true);
            expect(callArgs.quality).toBe("720");
            expect(callArgs.outputFolder).toBe("/home/user/Downloads");
            expect(callArgs.playlistTitle).toBe("My Playlist");
            expect(notifyDownloadFinished).toHaveBeenCalledWith(
                "/home/user/Downloads",
                true
            );
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Download Done !",
                outputFolder: "/home/user/Downloads",
            });
        });

        test("defaults quality to best for invalid quality", async () => {
            isValidUrl.mockReturnValue(true);
            fetchDownload.mockResolvedValue("/downloads");
            req.body = {url: "https://youtube.com/watch?v=123", quality: "invalid"};
            await downloadController(req, res);
            const callArgs = fetchDownload.mock.calls[0][0];
            expect(callArgs.quality).toBe("best");
        });

        test("returns 409 when download already in progress", async () => {
            isValidUrl.mockReturnValue(true);
            fetchDownload.mockRejectedValue(new Error("Download already in progress"));
            req.body.url = "https://youtube.com/watch?v=123";
            await downloadController(req, res);
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                error: {code: "DOWNLOAD_IN_PROGRESS", message: "A download is already in progress"},
            });
        });

        test("returns 500 on generic error", async () => {
            isValidUrl.mockReturnValue(true);
            fetchDownload.mockRejectedValue(new Error("yt-dlp failed"));
            req.body.url = "https://youtube.com/watch?v=123";
            await downloadController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: {code: "DOWNLOAD_FAILED", message: "Server Error"},
            });
            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe("cancelDownloadController", () => {
        test("returns success when download cancelled", () => {
            cancelDownload.mockReturnValue(true);
            cancelDownloadController(req, res);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Download stopped! Queue cleared.",
            });
            expect(logger.info).toHaveBeenCalled();
        });

        test("returns 400 when no download in progress", () => {
            cancelDownload.mockReturnValue(false);
            cancelDownloadController(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: {code: "NO_DOWNLOAD_IN_PROGRESS", message: "No download in progress !"},
            });
            expect(logger.warn).toHaveBeenCalled();
        });
    });

    describe("SSE controllers", () => {
        test("progressController sets headers and writes data", () => {
            req.on = jest.fn((event, cb) => {
                if (event === "close") {
                    // don't call immediately
                }
            });
            progressController(req, res);
            expect(res.set).toHaveBeenCalledWith(
                expect.objectContaining({
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive",
                })
            );
            expect(res.flushHeaders).toHaveBeenCalled();
        });

        test("speedController sets headers", () => {
            req.on = jest.fn();
            speedController(req, res);
            expect(res.set).toHaveBeenCalledWith(
                expect.objectContaining({
                    "Content-Type": "text/event-stream",
                })
            );
        });

        test("stageController sets headers", () => {
            req.on = jest.fn();
            stageController(req, res);
            expect(res.set).toHaveBeenCalledWith(
                expect.objectContaining({
                    "Content-Type": "text/event-stream",
                })
            );
        });

        test("playlistInfoController sets headers", () => {
            req.on = jest.fn();
            playlistInfoController(req, res);
            expect(res.set).toHaveBeenCalledWith(
                expect.objectContaining({
                    "Content-Type": "text/event-stream",
                })
            );
        });
    });
});
