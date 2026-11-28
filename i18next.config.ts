import { defineConfig } from 'i18next-cli';

export default defineConfig({
    "locales": [
        "en"
    ],
    "extract": {
        "input": [
            "src/**/*.{ts,tsx}"
        ],
        "output": "public/locales/{{language}}/{{namespace}}.json",
        "defaultNS": "translation",
        "contextSeparator": "_",
        "functions": [
            "t",
            "*.t"
        ],
        "transComponents": [
            "Trans"
        ],
        // Keep the file's order and indentation; dynamic keys (`chartTypes.${x}`) aren't found in the source
        "sort": false,
        "indentation": 4,
        "removeUnusedKeys": false
    },
    "types": {
        "input": [
            "locales/{{language}}/{{namespace}}.json"
        ],
        "output": "src/types/i18next.d.ts"
    }
});