const {mergeMissingFeatures} = require("../../config");

describe("configuration migration", () => {
    test("adds missing defaults and preserves user values", () => {
        const result = mergeMissingFeatures(
            {enabled: true, retries: 3},
            {enabled: false}
        );

        expect(result).toEqual({
            features: {enabled: false, retries: 3},
            changed: true,
        });
    });

    test("preserves unknown user-defined keys", () => {
        const result = mergeMissingFeatures(
            {enabled: true},
            {enabled: false, customSetting: "keep me"}
        );

        expect(result).toEqual({
            features: {enabled: false, customSetting: "keep me"},
            changed: false,
        });
    });

    test("reports no migration when all default keys exist", () => {
        const result = mergeMissingFeatures(
            {enabled: true, retries: 3},
            {enabled: false, retries: 0}
        );

        expect(result.changed).toBe(false);
        expect(result.features.retries).toBe(0);
    });

    test("rejects non-object configurations", () => {
        expect(() => mergeMissingFeatures({}, [])).toThrow(
            "User configuration must be a JSON object"
        );
    });
});
