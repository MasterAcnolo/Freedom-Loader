const path = require("path");

jest.mock("../../server/helpers/getBrowser.helpers.js", () =>
    jest.fn(() => "firefox")
);

jest.mock("../../server/helpers/path.helpers.js", () => ({
    ffmpegPath: "/mock/ffmpeg",
    denoPath: "/mock/deno",
}));

jest.mock("../../config.js", () => ({
    configFeatures: {
        autoUpdate: false,
        discordRPC: false,
        customTopBar: false,
        autoCheckInfo: false,
        addThumbnail: true,
        addMetadata: true,
        verboseLogs: false,
        autoDownloadPlaylist: false,
        customCodec: "h264",
    },
}));

jest.mock("../../server/logger.js", () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

const { buildYtDlpArgs } = require("../../server/helpers/buildArgs.helpers");
const { configFeatures } = require("../../config");
const { logger } = require("../../server/logger");

describe("buildYtDlpArgs", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("builds default video arguments", () => {
        const args = buildYtDlpArgs({
            url: "https://youtube.com/watch?v=123",
            audioOnly: false,
            quality: "best",
            outputFolder: "/downloads",
        });

        expect(args).toContain("--cookies-from-browser");
        expect(args).toContain("firefox");

        expect(args).toContain("--ffmpeg-location");
        expect(args).toContain("/mock/ffmpeg");

        expect(args).toContain("--js-runtimes");
        expect(args).toContain("deno:/mock/deno");

        expect(args).toContain("--merge-output");
        expect(args).toContain("mp4");

        expect(args).toContain("-f");
        expect(args).toContain("bestvideo+bestaudio/best/mp4");

        expect(args).toContain(
            path.join("/downloads", "%(title)s.%(ext)s")
        );

        expect(args.at(-1)).toBe("https://youtube.com/watch?v=123");
    });

    test("builds audio-only arguments", () => {
        const args = buildYtDlpArgs({
            url: "https://youtube.com/watch?v=123",
            audioOnly: true,
            quality: "best",
            outputFolder: "/downloads",
        });

        expect(args).toContain("--extract-audio");
        expect(args).toContain("--audio-format");
        expect(args).toContain("mp3");
        expect(args).toContain("bestaudio");

        expect(args).not.toContain("--merge-output");
    });

    test("uses requested quality", () => {
        const args = buildYtDlpArgs({
            url: "https://youtube.com/watch?v=123",
            audioOnly: false,
            quality: "720",
            outputFolder: "/downloads",
        });

        expect(args).toContain(
            "bestvideo[height<=720]+bestaudio/best[height<=720]/mp4"
        );
    });

    test("falls back to best for unknown quality", () => {
        const args = buildYtDlpArgs({
            url: "https://youtube.com/watch?v=123",
            audioOnly: false,
            quality: "unknown",
            outputFolder: "/downloads",
        });

        expect(args).toContain("best");
    });

    test("uses --no-playlist by default", () => {
        const args = buildYtDlpArgs({
            url: "https://youtube.com/watch?v=123",
            audioOnly: false,
            quality: "best",
            outputFolder: "/downloads",
        });

        expect(args).toContain("--no-playlist");
        expect(args).not.toContain("--yes-playlist");
    });

    test("uses --yes-playlist when enabled", () => {
        configFeatures.autoDownloadPlaylist = true;

        const args = buildYtDlpArgs({
            url: "https://youtube.com/watch?v=123",
            audioOnly: false,
            quality: "best",
            outputFolder: "/downloads",
        });

        expect(args).toContain("--yes-playlist");
        expect(args).not.toContain("--no-playlist");

        configFeatures.autoDownloadPlaylist = false;
    });

    test("embeds thumbnail and metadata when enabled", () => {
        const args = buildYtDlpArgs({
            url: "https://youtube.com/watch?v=123",
            audioOnly: false,
            quality: "best",
            outputFolder: "/downloads",
        });

        expect(args).toContain("--embed-thumbnail");
        expect(args).toContain("--add-metadata");
    });

    test("logs codec validation", () => {
        buildYtDlpArgs({
            url: "https://youtube.com/watch?v=123",
            audioOnly: false,
            quality: "best",
            outputFolder: "/downloads",
        });

        expect(logger.info).toHaveBeenCalledWith("Codec Valid: h264");
    });

    test("falls back to h264 when codec is invalid", () => {
        configFeatures.customCodec = "invalid";

        const args = buildYtDlpArgs({
            url: "https://youtube.com/watch?v=123",
            audioOnly: false,
            quality: "best",
            outputFolder: "/downloads",
        });

        expect(logger.error).toHaveBeenCalledWith(
            "Codec not valid: invalid. Using default codec"
        );

        const sortIndex = args.indexOf("-S");
        expect(args[sortIndex + 1]).toContain("vcodec:h264");

        configFeatures.customCodec = "h264";
    });
});