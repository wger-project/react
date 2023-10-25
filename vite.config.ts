import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => {
    return {
        build: {
            outDir: 'build',
        },
        plugins: [react(), viteTsconfigPaths()],
        test: {
            environment: 'jsdom',
            globals: true,
            setupFiles: './src/tests/setup.ts',
        },
    };
});