/// <reference types="vite/client" />

import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tailwindcss(),
		react({
			babel: {
				plugins: ['babel-plugin-react-compiler'],
			},
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@/ui': path.resolve(__dirname, './src/ui'),
			'@/lib': path.resolve(__dirname, './src/lib'),
			'@/hooks': path.resolve(__dirname, './src/hooks'),
			'@/utils': path.resolve(__dirname, './src/utils'),
			'@/components': path.resolve(__dirname, './src/components'),
		},
	},
})
