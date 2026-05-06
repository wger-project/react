import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import i18n from 'i18next';
import { TextDecoder, TextEncoder } from 'node:util';
import { initReactI18next } from 'react-i18next';
import { afterEach, vi } from 'vitest';

// Mock the translations
i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['translations'],
    defaultNS: 'translations',
    interpolation: {
        escapeValue: false, // not needed for react!!
    },
    resources: { en: { translations: {} } },
});

vi.mock('@/config', () => {
    return {
        IS_PROD: false,
        PUBLIC_URL: '',
        SERVER_URL: 'https://example.com',
        TIME_ZONE: 'UTC',
        MIN_ACCOUNT_AGE_TO_TRUST: 21,
        VITE_API_SERVER: 'https://example.com',
        VITE_API_KEY: '122333444455555666666',
    };
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.TextEncoder = TextEncoder as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.TextDecoder = TextDecoder as any;

// jsdom doesn't provide these browser APIs that recharts/react-resize-detector rely on.
class MockResizeObserver {
    observe(): void {
    }

    unobserve(): void {
    }

    disconnect(): void {
    }
}

class MockIntersectionObserver {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds: ReadonlyArray<number> = [];

    observe(): void {
    }

    unobserve(): void {
    }

    disconnect(): void {
    }

    takeRecords(): IntersectionObserverEntry[] {
        return [];
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.ResizeObserver = MockResizeObserver as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.IntersectionObserver = MockIntersectionObserver as any;

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup();
});
