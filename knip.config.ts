import type { KnipConfig } from 'knip'

const config: KnipConfig = {
	ignore: ['**/ui/**', '**/components/ui/**', 'tools/**', 'apps/web/src/root.tsx'],
	ignoreDependencies: ['tailwindcss', 'tw-animate-css'],
}

export default config
