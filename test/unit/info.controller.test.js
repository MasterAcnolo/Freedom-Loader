jest.mock("../../server/services/info.services", () => ({
    fetchNormalizedInfo: jest.fn(),
}));
jest.mock("../../server/logger", () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));
jest.mock("../../server/helpers/validation.helpers", () => ({
    isValidUrl: jest.fn(),
}));

const {fetchNormalizedInfo} = require("../../server/services/info.services");
const {logger} = require("../../server/logger");
const {isValidUrl} = require("../../server/helpers/validation.helpers");
const {infoController} = require("../../server/controller/info.controller");

describe("info.controller", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {query: {}, body: {}};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    test("returns 400 for missing url", async () => {
        isValidUrl.mockReturnValue(false);
        req.query.url = undefined;
        await infoController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: {code: "INVALID_URL", message: "Invalid or missing URL"},
        });
    });

    test("returns 400 for invalid url", async () => {
        isValidUrl.mockReturnValue(false);
        req.query.url = "not-a-url";
        await infoController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: {code: "INVALID_URL", message: "Invalid or missing URL"},
        });
    });

    test("accepts url from body", async () => {
        isValidUrl.mockReturnValue(true);
        req.body.url = "https://youtube.com/watch?v=123";
        fetchNormalizedInfo.mockResolvedValue({type: "video", title: "Test"});
        await infoController(req, res);
        expect(fetchNormalizedInfo).toHaveBeenCalledWith("https://youtube.com/watch?v=123");
        expect(res.json).toHaveBeenCalledWith({type: "video", title: "Test"});
    });

    test("returns normalized result for valid url", async () => {
        isValidUrl.mockReturnValue(true);
        req.query.url = "https://youtube.com/watch?v=123";
        const mockResult = {type: "video", title: "My Video", duration: 120};
        fetchNormalizedInfo.mockResolvedValue(mockResult);
        await infoController(req, res);
        expect(fetchNormalizedInfo).toHaveBeenCalledWith("https://youtube.com/watch?v=123");
        expect(res.json).toHaveBeenCalledWith(mockResult);
        expect(logger.info).toHaveBeenCalled();
    });

    test("returns 500 on service error", async () => {
        isValidUrl.mockReturnValue(true);
        req.query.url = "https://youtube.com/watch?v=123";
        fetchNormalizedInfo.mockRejectedValue(new Error("fetch failed"));
        await infoController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: {code: "FETCH_FAILED", message: "Unable to fetch info"},
        });
        expect(logger.error).toHaveBeenCalled();
    });
});
