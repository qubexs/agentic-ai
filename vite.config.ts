import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main/index.ts',
        onstart(options) {
          options.startup();
        },
        vite: {
          build: {
            outDir: 'dist-electron/main',
            lib: {
              entry: 'electron/main/index.ts',
              formats: ['cjs']
            },
            rollupOptions: {
              external: ['electron', 'node-pty', 'fs', 'path', 'child_process', 'url'],
              output: {
                entryFileNames: '[name].js'
              }
            }
          }
        }
      },
      {
        entry: 'electron/preload/index.ts',
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron/preload',
            lib: {
              entry: 'electron/preload/index.ts',
              formats: ['cjs']
            },
            rollupOptions: {
              external: ['electron'],
              output: {
                entryFileNames: '[name].js'
              }
            }
          }
        }
      }
    ]),
    renderer()
  ],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});