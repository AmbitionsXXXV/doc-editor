import { cn } from '@doc-editor/ui/lib/utils'
import type { HTMLAttributes } from 'react'

// -- 定义图标类型
export type IconType =
	| 'document'
	| 'edit'
	| 'device'
	| 'notification'
	| 'folder'
	| 'share'
	| 'trash'
	| 'settings'
	| 'user'
	| 'search'
	| 'plus'
	| 'check'
	| 'x'
	| 'github'

// -- 颜色类型
export type IconColor =
	| 'primary'
	| 'destructive'
	| 'accent'
	| 'muted'
	| 'current'
	| string

// -- 图标组件属性接口
export interface IconProps extends HTMLAttributes<SVGElement> {
	type: IconType
	size?: number
	strokeWidth?: number
	className?: string
	color?: IconColor
	animate?: 'pulse' | 'spin' | 'bounce' | 'none'
}

export const Icon = ({
	type,
	size = 24,
	strokeWidth = 2,
	className,
	color = 'current',
	animate = 'none',
	...props
}: IconProps) => {
	// -- 根据类型返回对应的图标路径
	const renderPath = () => {
		switch (type) {
			case 'github':
				return (
					<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
				)
			case 'document':
				return (
					<>
						<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
						<polyline points="14 2 14 8 20 8" />
						<path d="M9.5 12.5l1.5 1.5 3.5-3.5" />
					</>
				)
			case 'edit':
				return <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
			case 'device':
				return (
					<>
						<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
						<line x1="8" y1="21" x2="16" y2="21"></line>
						<line x1="12" y1="17" x2="12" y2="21"></line>
					</>
				)
			case 'notification':
				return (
					<>
						<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
						<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
					</>
				)
			case 'folder':
				return (
					<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
				)
			case 'share':
				return (
					<>
						<circle cx="18" cy="5" r="3"></circle>
						<circle cx="6" cy="12" r="3"></circle>
						<circle cx="18" cy="19" r="3"></circle>
						<line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
						<line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
					</>
				)
			case 'trash':
				return (
					<>
						<polyline points="3 6 5 6 21 6"></polyline>
						<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
					</>
				)
			case 'settings':
				return (
					<>
						<circle cx="12" cy="12" r="3"></circle>
						<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
					</>
				)
			case 'user':
				return (
					<>
						<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
						<circle cx="12" cy="7" r="4"></circle>
					</>
				)
			case 'search':
				return (
					<>
						<circle cx="11" cy="11" r="8"></circle>
						<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
					</>
				)
			case 'plus':
				return (
					<>
						<line x1="12" y1="5" x2="12" y2="19"></line>
						<line x1="5" y1="12" x2="19" y2="12"></line>
					</>
				)
			case 'check':
				return <polyline points="20 6 9 17 4 12"></polyline>
			case 'x':
				return (
					<>
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</>
				)
			default:
				return null
		}
	}

	// -- 根据动画类型返回对应的动画类名
	const getAnimationClass = () => {
		switch (animate) {
			case 'pulse':
				return 'animate-pulse'
			case 'spin':
				return 'animate-spin'
			case 'bounce':
				return 'animate-bounce'
			default:
				return ''
		}
	}

	// -- 根据颜色类型返回对应的颜色类名
	const getColorClass = () => {
		switch (color) {
			case 'primary':
				return 'stroke-primary'
			case 'destructive':
				return 'stroke-destructive'
			case 'accent':
				return 'stroke-accent'
			case 'muted':
				return 'stroke-muted-foreground'
			case 'current':
				return 'stroke-current'
			default:
				return ''
		}
	}

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
			className={cn(getAnimationClass(), getColorClass(), className)}
			{...props}
		>
			{renderPath()}
		</svg>
	)
}

export default Icon
