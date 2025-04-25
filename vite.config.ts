import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import eslintPlugin from "vite-plugin-eslint";
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => {
    return {
        build: {
            outDir: 'build',
        },
        server: {
            open: true,
            port: 3000,
        },
        plugins: [
            react({
                jsxImportSource: '@emotion/react',
                babel: {
                    plugins: ['@emotion/babel-plugin'],
                },
            }),
            viteTsconfigPaths(),
            eslintPlugin({
                cache: false,
                include: ['./src/**/*.js', './src/**/*.jsx', './src/**/*.ts', './src/**/*.tsx'],
                exclude: [],
            }),
        ],
        test: {
            environment: 'jsdom',
            globals: true,
            setupFiles: './src/tests/setup.ts',
        },
    };
});