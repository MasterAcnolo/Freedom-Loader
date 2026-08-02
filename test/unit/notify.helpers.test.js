const mockShow = jest.fn();
const mockOn = jest.fn();
const mockOpenPath = jest.fn();
const mockOpenExternal = jest.fn();

jest.mock("electron", () => ({
    Notification: jest.fn().mockImplementation(() => ({
        show: mockShow,
        on: mockOn,
    })),
    shell: {
        openPath: mockOpenPath,
        openExternal: mockOpenExternal,
    },
}));

jest.mock("../../server/helpers/path.helpers", () => ({
    iconPaths: {
        confirm: "/icons/confirm.png",
        error: "/icons/error.png",
    },
}));

jest.mock("../../server/logger", () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

const { Notification, shell } = require("electron");

const {
    notifyDownloadFinished,
    notifyCookiesBrowserError,
    notifyFirefoxBrowserMissing,
} = require("../../server/helpers/notify.helpers");

describe("notify.helpers", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("notifyDownloadFinished", () => {
        test("does nothing when notifications are disabled", () => {
            notifyDownloadFinished("/downloads", false);

            expect(Notification).not.toHaveBeenCalled();
        });

        test("does nothing when folder is missing", () => {
            notifyDownloadFinished(undefined, true);

            expect(Notification).not.toHaveBeenCalled();
        });

        test("creates and shows notification", () => {
            notifyDownloadFinished("/downloads");

            expect(Notification).toHaveBeenCalledWith({
                title: "Freedom Loader",
                body: "Your download is complete, click here to open it.",
                icon: "/icons/confirm.png",
            });

            expect(mockOn).toHaveBeenCalledWith(
                "click",
                expect.any(Function)
            );

            expect(mockShow).toHaveBeenCalled();
        });

        test("opens folder when notification is clicked", () => {
            notifyDownloadFinished("/downloads");

            const callback = mockOn.mock.calls[0][1];
            callback();

            expect(shell.openPath).toHaveBeenCalledWith("/downloads");
        });
    });

    describe("notifyCookiesBrowserError", () => {
        test("creates notification", () => {
            notifyCookiesBrowserError();

            expect(Notification).toHaveBeenCalledWith({
                title: "Cookies Error",
                body: "Unable to retrieve cookies. Please log in to your browser and click here to view the tutorial.",
                icon: "/icons/error.png",
            });

            expect(mockShow).toHaveBeenCalled();
        });

        test("opens tutorial when clicked", () => {
            notifyCookiesBrowserError();

            const callback = mockOn.mock.calls[0][1];
            callback();

            expect(shell.openExternal).toHaveBeenCalledWith(
                "https://youtube.com/shorts/cN9f4s1Mf88?si=519QCVd_-fzJqRf1"
            );
        });
    });

    describe("notifyFirefoxBrowserMissing", () => {
        test("creates notification", () => {
            notifyFirefoxBrowserMissing();

            expect(Notification).toHaveBeenCalledWith({
                title: "Firefox Missing",
                body: "Firefox was not found on your system. Click here to follow the installation guide",
                icon: "/icons/error.png",
            });

            expect(mockShow).toHaveBeenCalled();
        });

        test("opens installation guide when clicked", () => {
            notifyFirefoxBrowserMissing();

            const callback = mockOn.mock.calls[0][1];
            callback();

            expect(shell.openExternal).toHaveBeenCalledWith(
                "https://youtube.com/shorts/cN9f4s1Mf88?si=519QCVd_-fzJqRf1"
            );
        });
    });
});