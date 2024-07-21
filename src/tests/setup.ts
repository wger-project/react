import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

global.jest = vi;

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup();
});