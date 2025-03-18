import { defineConfig } from '@rslib/core'

export default defineConfig({
	source: {
		entry: {
			index: './src/index.ts',
		},
	},
	lib: [
		{
			format: 'esm',
			syntax: 'esnext',
			dts: true,
			output: { distPath: { root: 'build/esm' } },
		},
		{
			format: 'cjs',
			syntax: 'esnext',
			dts: true,
			output: { distPath: { root: 'build/cjs' } },
		},
	],
	output: {
		minify: true,
		sourceMap: true,
		cleanDistPath: true,
	},
	resolve: {},
})
