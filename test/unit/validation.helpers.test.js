const {isValidUrl, isSafePath} = require("../../server/helpers/validation.helpers");

describe("validation.helpers", () => {
    describe("isValidUrl", () => {
        test("returns true for valid http url", () => {
            expect(isValidUrl("http://example.com")).toBe(true);
        });

        test("returns true for valid https url", () => {
            expect(isValidUrl("https://youtube.com/watch?v=123")).toBe(true);
        });

        test("returns false for invalid url", () => {
            expect(isValidUrl("not-a-url")).toBe(false);
        });

        test("returns false for empty string", () => {
            expect(isValidUrl("")).toBe(false);
        });
    });

    describe("isSafePath", () => {
        test("returns false for empty or short path", () => {
            expect(isSafePath("")).toBe(false);
            expect(isSafePath("ab")).toBe(false);
        });

        test("returns false for Windows System32 path", () => {
            expect(isSafePath("C:\\Windows\\System32\\test")).toBe(false);
        });

        test("returns false for Windows path containing Windows", () => {
            expect(isSafePath("C:\\Windows\\SomeFolder")).toBe(false);
        });

        test("returns true for safe user path", () => {
            expect(isSafePath("/home/user/Downloads")).toBe(true);
        });
    });
});
