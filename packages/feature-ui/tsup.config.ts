import { defineConfig } from 'tsup'

export default defineConfig([
	{
		entry: ['src/index.tsx'],
		format: ['esm'],
		sourcemap: true,
		bundle: true,
		// dts: false,
		dts: true,
		clean: true,
		minify: true,
		outDir: 'build/esm',
	},
])
