// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { TextDecoder, TextEncoder } from 'util';

// Mock the translations
i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',

    // have a common namespace used around the full app
    ns: ['translations'],
    defaultNS: 'translations',

    // debug: true,

    interpolation: {
        escapeValue: false, // not needed for react!!
    },

    resources: { en: { translations: {} } },
});

jest.mock('./config', () => {
    return {
        IS_PROD: false,
        SERVER_URL: 'https://example.com',
        VITE_API_SERVER: 'https://example.com',
        VITE_API_KEY: '122333444455555666666'
    };
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.TextEncoder = TextEncoder as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.TextDecoder = TextDecoder as any;