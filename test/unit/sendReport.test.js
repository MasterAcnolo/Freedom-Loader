jest.mock("../../server/logger", () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
    logDir: null,
}));

const { sendReport } = require("../../app/sendReport");

describe("sendReport", () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.BUG_REPORT_URL = "";
        process.env.BUG_REPORT_API_KEY = "";
        global.fetch = jest.fn();
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    test("throws a clear error when backend bug report config is missing", async () => {
        await expect(
            sendReport({
                title: "Bug title",
                description: "Bug description",
                includeLogs: "no",
            }),
        ).rejects.toThrow(
            "Bug report service is not configured. Missing BUG_REPORT_URL or BUG_REPORT_API_KEY on backend.",
        );

        expect(global.fetch).not.toHaveBeenCalled();
    });

    test("sends request from backend when bug report config is present", async () => {
        process.env.BUG_REPORT_URL = "https://example.com/report";
        process.env.BUG_REPORT_API_KEY = "safe-test-key";
        global.fetch.mockResolvedValue({ ok: true });

        await expect(
            sendReport({
                title: "Bug title",
                description: "Bug description",
                includeLogs: "no",
            }),
        ).resolves.toBe(true);

        expect(global.fetch).toHaveBeenCalledWith(
            "https://example.com/report",
            expect.objectContaining({
                method: "POST",
                headers: {
                    "X-Api-Key": "safe-test-key",
                },
            }),
        );
    });
});
