import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import eslintPlugin from '@nabla/vite-plugin-eslint';

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
            // @nabla lints every file Vite processes; shouldLint restricts it to our
            // own src/ js/jsx/ts/tsx (the old plugin's `include` glob), skipping deps.
            ...(isTest ? [] : [eslintPlugin({
                shouldLint: path => /\/src\/.*\.[jt]sx?(\?|$)/.test(path),
            })]),
        ],
        test: {
            environment: 'happy-dom',
            globals: true,
            setupFiles: './src/tests/setup.ts',
            testTimeout: 15000,
            include: ['src/**/*.{test,spec}.{ts,tsx}'],
            css: false,
            pool: 'threads',
            maxWorkers: '50%',
            minWorkers: 1,

            server: {
                deps: {
                    // @mui/material@9.1+ imports react-transition-group/TransitionGroupContext
                    // (a pseudo-directory resolved via its package.json "module" field). Loaded
                    // externally via native ESM, that directory import fails; inlining @mui/material
                    // routes it through Vite's resolver, which honors the "module" field.
                    inline: ['@mui/material'],
                },
            },

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