import { defineConfig } from 'vite';

// Separate Vite config for GitHub Pages (static demo).
// This avoids touching the Laravel (PHP) runtime and deploys a static site only.
export default defineConfig({
    root: 'pages',
    base: './',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
    },
});
