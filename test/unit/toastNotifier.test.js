const mockSend = jest.fn();
const mockGetMainWindow = jest.fn();

jest.mock("../../app/windowManager", () => ({
    getMainWindow: mockGetMainWindow,
}));

const {sendToast} = require("../../app/toastNotifier");

describe("toastNotifier", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("sends a toast to the active renderer", () => {
        mockGetMainWindow.mockReturnValue({
            isDestroyed: () => false,
            webContents: {
                isDestroyed: () => false,
                send: mockSend,
            },
        });

        expect(sendToast("Firefox is missing", "error", 5000)).toBe(true);
        expect(mockSend).toHaveBeenCalledWith("show-toast", {
            message: "Firefox is missing",
            type: "error",
            duration: 5000,
        });
    });

    test("does not throw when the renderer is unavailable", () => {
        mockGetMainWindow.mockReturnValue(null);

        expect(sendToast("Firefox is missing", "error")).toBe(false);
        expect(mockSend).not.toHaveBeenCalled();
    });
});
