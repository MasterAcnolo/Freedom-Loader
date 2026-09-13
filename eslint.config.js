const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
    js.configs.recommended,

    {ignores: ["node_modules/**", "srpm-out/**", "dist/**", "test/**"]},

    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",
        },
        rules: {
            "no-unused-vars": ["error", {argsIgnorePattern: "^_"}],
            "no-console": "off",
            "semi": ["error", "always"]
        },


    },
    {
        files: ["app/**", "server/**", "main.js"],
        languageOptions: {
            globals: {...globals.node}
        }
    },
    {
        files: ["public/**"],
        languageOptions: {
            globals: {...globals.browser}
        }
    },
    {
        files: ["preload.js"],
        languageOptions: {
            globals: {...globals.node, ...globals.browser}
        }
    }
];