import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  root: 'src/renderer',
  build: {
    modulePreload: false,
    outDir: '../../dist/renderer',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/src/content/modules/module-')) {
            const match = id.match(/module-(\d+)/);
            const moduleId = match ? Number(match[1]) : 0;
            if (moduleId >= 17) return 'content-fullstack';
            if (moduleId >= 9) return 'content-advanced';
            return 'content-core';
          }
          if (id.includes('node_modules/monaco-editor') || id.includes('node_modules/@monaco-editor')) {
            return 'monaco';
          }
          if (id.includes('node_modules/react-markdown') || id.includes('node_modules/remark') || id.includes('node_modules/rehype') || id.includes('node_modules/react-syntax-highlighter') || id.includes('node_modules/prismjs')) {
            return 'markdown-vendor';
          }
          if (id.includes('node_modules/@radix-ui') || id.includes('node_modules/framer-motion') || id.includes('node_modules/lucide-react')) {
            return 'ui-vendor';
          }
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
            return 'react-vendor';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer'),
      '@components': path.resolve(__dirname, 'src/renderer/components'),
      '@lib': path.resolve(__dirname, 'src/renderer/lib'),
      '@hooks': path.resolve(__dirname, 'src/renderer/hooks'),
      '@stores': path.resolve(__dirname, 'src/renderer/stores'),
      '@content': path.resolve(__dirname, 'src/content'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});