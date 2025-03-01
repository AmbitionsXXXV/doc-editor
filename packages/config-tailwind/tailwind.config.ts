import type { Config } from 'tailwindcss'

const config: Omit<Config, 'content'> = {
	theme: {
		extend: {
			// 已将动画配置移至 index.css 中使用 @theme 指令定义
		},
	},
}

export default config
