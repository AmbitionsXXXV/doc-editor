/// <reference types="vite/client" />

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(
    {
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    },
  )],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@doc-editor/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
});
