import { join } from 'node:path'
import { defineConfig } from '@rslib/core'

export default defineConfig({
	source: {
		entry: {
			index: './src/index.ts',
		},
	},
	lib: [
		{ format: 'esm', syntax: 'es2021' },
		{ format: 'cjs', syntax: 'es2021' },
	],
	resolve: {
		alias: {
			'@doc-editor/ui': join(__dirname, 'src'),
			'@doc-editor/ui/components': join(__dirname, 'src/components'),
			'@doc-editor/ui/lib': join(__dirname, 'src/lib'),
			'@doc-editor/ui/hooks': join(__dirname, 'src/hooks'),
		},
	},
	dts: { bundle: true },
})
