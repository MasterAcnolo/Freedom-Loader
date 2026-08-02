module.exports = {
    testEnvironment: "node",
    testMatch: ["**/test/unit/**/*.test.js"],
    collectCoverageFrom: [
        "server/**/*.js",
        "app/**/*.js",
        "!app/autoUpdater.js",
    ],

    modulePathIgnorePatterns: [
        "<rootDir>/dist",
        "<rootDir>/release",
        "<rootDir>/build",
    ],

    watchPathIgnorePatterns: [
        "<rootDir>/dist",
        "<rootDir>/release",
        "<rootDir>/build",
    ],
};