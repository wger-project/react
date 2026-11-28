import i18n from 'i18next';

/*
 * The locale dates and numbers are formatted and read in: the page language,
 * with the browser's region when the language has none (page "en", browser
 * "en-NZ" -> "en-NZ")
 */
export function formatLocale(language: string | undefined = i18n.language, preferred: readonly string[] = navigator.languages) {
    if (!language || language.includes('-')) {
        return language;
    }

    const prefix = `${language.toLowerCase()}-`;
    return preferred.find(l => l.toLowerCase().startsWith(prefix)) ?? language;
}
