const mockDownloadUpdate = jest.fn();
const mockCheckForUpdates = jest.fn();
const mockOn = jest.fn();
const mockQuitAndInstall = jest.fn();

jest.mock("electron-updater", () => ({
  autoUpdater: {
    autoDownload: true,
    autoInstallOnAppQuit: true,
    on: mockOn,
    checkForUpdates: mockCheckForUpdates,
    downloadUpdate: mockDownloadUpdate,
    quitAndInstall: mockQuitAndInstall,
  },
}));

jest.mock("electron", () => ({
  app: {
    isPackaged: true,
  },
}));

const mockLoggerError = jest.fn();
jest.mock("../../server/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: mockLoggerError,
  },
}));

const { downloadUpdate } = require("../../app/autoUpdater");

describe("autoUpdater.downloadUpdate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("resolves when electron-updater download succeeds", async () => {
    mockDownloadUpdate.mockResolvedValue(undefined);

    await expect(downloadUpdate()).resolves.toBeUndefined();
    expect(mockDownloadUpdate).toHaveBeenCalledTimes(1);
  });

  test("rejects when electron-updater download fails", async () => {
    const error = new Error("network down");
    mockDownloadUpdate.mockRejectedValue(error);

    await expect(downloadUpdate()).rejects.toThrow("network down");
    expect(mockLoggerError).toHaveBeenCalledWith("Download failed:", "network down");
  });
});
