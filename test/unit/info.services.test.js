jest.mock("child_process");
jest.mock("../../server/helpers/path.helpers", () => ({
    userYtDlp: "/mock/yt-dlp",
    denoPath: "/mock/deno",
}));
jest.mock("../../server/helpers/getBrowser.helpers", () => ({
    getUserBrowser: jest.fn(() => "firefox"),
}));
jest.mock("../../server/logger", () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
    },
}));
jest.mock("../../server/helpers/parseInfo.helpers", () => ({
    parseVideo: jest.fn((data) => ({type: "video", ...data})),
    parsePlaylist: jest.fn((data) => ({
        type: "playlist",
        title: data.title,
        count: data.entries ? data.entries.length : 0,
        videos: [],
    })),
}));
jest.mock("../../server/helpers/playlist.helpers", () => ({
    isUrlPlaylist: jest.fn(),
}));

const {execFile} = require("child_process");
const {fetchInfo, fetchNormalizedInfo} = require("../../server/services/info.services");
const {parseVideo, parsePlaylist} = require("../../server/helpers/parseInfo.helpers");
const {isUrlPlaylist} = require("../../server/helpers/playlist.helpers");
const {logger} = require("../../server/logger");

describe("info.services", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("fetchInfo", () => {
        test("resolves parsed json on success", async () => {
            execFile.mockImplementation((cmd, args, opts, cb) => {
                cb(null, JSON.stringify({_type: "video", title: "Test"}), "");
            });
            const result = await fetchInfo("https://youtube.com/watch?v=123");
            expect(result).toEqual({_type: "video", title: "Test"});
            expect(execFile).toHaveBeenCalled();
        });

        test("rejects when cookies error in stderr", async () => {
            execFile.mockImplementation((cmd, args, opts, cb) => {
                cb(null, "", "sign in to confirm you're not a bot");
            });
            await expect(fetchInfo("https://youtube.com/watch?v=123")).rejects.toThrow(
                /Unable to extract cookies/
            );
        });

        test("rejects on exec error", async () => {
            execFile.mockImplementation((cmd, args, opts, cb) => {
                cb(new Error("spawn failed"), "", "");
            });
            await expect(fetchInfo("https://youtube.com/watch?v=123")).rejects.toThrow(
                "Unable to fetch Info."
            );
        });

        test("rejects when no stdout", async () => {
            execFile.mockImplementation((cmd, args, opts, cb) => {
                cb(null, "", "");
            });
            await expect(fetchInfo("https://youtube.com/watch?v=123")).rejects.toThrow(
                "No Data Received."
            );
        });

        test("rejects on invalid json", async () => {
            execFile.mockImplementation((cmd, args, opts, cb) => {
                cb(null, "not json", "");
            });
            await expect(fetchInfo("https://youtube.com/watch?v=123")).rejects.toThrow(
                "JSON unreadable."
            );
        });
    });

    describe("fetchNormalizedInfo", () => {
        test("normalizes video", async () => {
            isUrlPlaylist.mockReturnValue(false);
            execFile.mockImplementation((cmd, args, opts, cb) => {
                cb(null, JSON.stringify({_type: "video", title: "My Video"}), "");
            });
            const result = await fetchNormalizedInfo("https://youtube.com/watch?v=123");
            expect(result.type).toBe("video");
            expect(parseVideo).toHaveBeenCalled();
        });

        test("normalizes playlist", async () => {
            isUrlPlaylist.mockReturnValue(true);
            execFile.mockImplementation((cmd, args, opts, cb) => {
                cb(
                    null,
                    JSON.stringify({
                        _type: "playlist",
                        title: "Playlist",
                        entries: [{id: "1"}, {id: "2"}],
                    }),
                    ""
                );
            });
            const result = await fetchNormalizedInfo("https://youtube.com/playlist?list=ABC");
            expect(result.type).toBe("playlist");
            expect(parsePlaylist).toHaveBeenCalled();
        });

        test("converts playlist with 1 entry to video", async () => {
            isUrlPlaylist.mockReturnValue(true);
            execFile.mockImplementation((cmd, args, opts, cb) => {
                cb(
                    null,
                    JSON.stringify({
                        _type: "playlist",
                        title: "Playlist",
                        entries: [{id: "1", title: "Single"}],
                    }),
                    ""
                );
            });
            const result = await fetchNormalizedInfo("https://youtube.com/playlist?list=ABC");
            expect(result.type).toBe("video");
            expect(parseVideo).toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalledWith(
                expect.stringContaining("Playlist with 1 item converted to video")
            );
        });

        test("falls back to single video when playlist fetch fails", async () => {
            isUrlPlaylist.mockReturnValue(true);
            let callCount = 0;
            execFile.mockImplementation((cmd, args, opts, cb) => {
                callCount++;
                if (callCount === 1) {
                    cb(new Error("fail"), "", "");
                } else {
                    cb(null, JSON.stringify({_type: "video", title: "Fallback"}), "");
                }
            });
            const result = await fetchNormalizedInfo("https://youtube.com/watch?v=123&list=ABC");
            expect(result.type).toBe("video");
            expect(callCount).toBe(2);
            expect(logger.info).toHaveBeenCalledWith(
                expect.stringContaining("Retrying as single video")
            );
        });

        test("throws when url is invalid type", async () => {
            await expect(fetchNormalizedInfo(null)).rejects.toThrow("Invalid URL");
        });
    });
});
