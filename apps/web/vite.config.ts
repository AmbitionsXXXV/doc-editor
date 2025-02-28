/// <reference types="vite/client" />

import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
	optimizeDeps: {
		include: ['react', 'react-dom'],
	},
})
