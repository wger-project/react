// See https://github.com/i18next/i18next-parser for more options

module.exports = {
    contextSeparator: '_',

    // Only set English here so only the english file gets updated, the rest happens on weblate
    locales: ['en'],

    input: ['src/**/*.{ts,tsx}'],
    output: 'public/locales/$LOCALE/$NAMESPACE.json'
}