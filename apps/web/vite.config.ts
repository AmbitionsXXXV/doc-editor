/// <reference types="vite/client" />

import path from 'node:path'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	// 加载环境变量，包括根目录和 apps/web 目录
	// 注意：这将优先使用 apps/web/.env 中的变量
	const rootPath = path.resolve(__dirname, '../../')

	// 优先加载根目录的环境变量
	const rootEnv = loadEnv(mode, rootPath, '')

	return {
		plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
		optimizeDeps: {
			include: ['react', 'react-dom'],
		},
		server: {
			host: rootEnv.VITE_HOST || 'localhost',
			port: Number.parseInt(rootEnv.VITE_PORT || '5173'),
		},
		define: {
			// 不要完全覆盖 import.meta.env，而是只添加你需要的变量
			// Vite 会自动将 VITE_ 前缀的环境变量暴露给客户端
			'import.meta.env.NODE_ENV': JSON.stringify(rootEnv.NODE_ENV),
		},
	}
})
