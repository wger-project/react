import { IS_PROD } from "config";
import i18n from "i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import common from "locales/en/translation.json";
import { initReactI18next } from "react-i18next";

export const resources = {
    en: {
        common,
    },
} as const;

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({

        // Also load the language code with the region code
        // e.g. 'pt' and 'pt-BR' are treated as different languages
        load: 'all',

        // Options for the language detection
        // https://github.com/i18next/i18next-browser-languageDetector
        detection: {
            // order and from where user language should be detected
            order: ['path', 'navigator', 'htmlTag'],

        },

        fallbackLng: 'en',

        //lng: "de",
        // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
        // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
        // if you're using a language detector, do not define the lng option

        interpolation: {
            escapeValue: false // not needed for react as it escapes by default
        },

        // During development the translation files are served from
        // locales/<lang>/<ns>.json but when copied over to the django site
        // (i.e.) production, the path is /static/react/locales/<lang>/<ns>.json
        //
        // To match the file name convention from weblate, we replace '-' with '_'
        backend: {
            loadPath: (lng: string[], ns: string[]) => {
                const lang = lng[0].replace('-', '_');
                return IS_PROD
                    ? `/static/react/locales/${lang}/${ns}.json`
                    : `/locales/${lang}/${ns}.json`;
            }
        },

        // TOOD: https://github.com/wger-project/react/issues/630
        //ns: ["common",],
        //defaultNS: 'common',
        //resources
    });

export default i18n;