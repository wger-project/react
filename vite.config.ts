import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';

export default defineConfig(({ mode }) => {
    const isTest = mode === 'test' || process.env.VITEST;
    return {
        resolve: {
            tsconfigPaths: true
        },
        build: {
            outDir: 'build',
            sourcemap: true,
            rollupOptions: {
                output: {
                    entryFileNames: 'main.js',
                    chunkFileNames: 'chunks/[name]-[hash].js',
                    assetFileNames: 'assets/[name][extname]',
                }
            }
        },
        server: {
            open: true,
            port: 3000,
        },
        plugins: [
            react({
                jsxImportSource: '@emotion/react',
            }),
            // The eslint plugin adds noise to test output and isn't needed during tests.
            ...(isTest ? [] : [eslintPlugin({
                cache: false,
                include: ['./src/**/*.js', './src/**/*.jsx', './src/**/*.ts', './src/**/*.tsx'],
                exclude: [],
            })]),
        ],
        test: {
            environment: 'happy-dom',
            globals: true,
            setupFiles: './src/tests/setup.ts',
            testTimeout: 15000,
            include: ['src/**/*.{test,spec}.{ts,tsx}'],
            css: false,
            // Threads pool with bounded concurrency — forks oversubscribes the
            // machine on multi-core systems and each worker re-bootstraps jsdom
            // & the i18n init, ballooning total runtime.
            pool: 'threads',
            maxWorkers: 4,
            minWorkers: 1,

            coverage: {
                provider: 'v8',
                reporter: ['text', 'lcov'],
                // Pages are integration shells — covered by e2e elsewhere.
                exclude: ['src/pages/**/*.tsx'],
            },
            // Pre-bundle heavy dependencies once (esbuild) instead of letting
            // Vite resolve every MUI/recharts/etc. module on demand per test
            // file. Without this, each test file pays a ~60s cold-import cost.
            deps: {
                optimizer: {
                    client: {
                        enabled: true,
                        include: [
                            '@mui/material',
                            '@mui/icons-material',
                            '@mui/lab',
                            '@mui/x-data-grid',
                            '@mui/x-date-pickers',
                            '@emotion/react',
                            '@emotion/styled',
                            'recharts',
                            'formik',
                            'react-i18next',
                            'react-router-dom',
                            '@tanstack/react-query',
                            '@testing-library/react',
                            '@testing-library/user-event',
                            '@testing-library/jest-dom',
                        ],
                    },
                },
            },
        },
    };
});