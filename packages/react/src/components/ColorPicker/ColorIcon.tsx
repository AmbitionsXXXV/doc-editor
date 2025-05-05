import { useMemo } from 'react'

export const ColorIcon = (
	props: Partial<{
		textColor: string | undefined
		backgroundColor: string | undefined
		size: number | undefined
	}>,
) => {
	const textColor = props.textColor || 'default'
	const backgroundColor = props.backgroundColor || 'default'
	const size = props.size || 16

	const style = useMemo(
		() =>
			({
				pointerEvents: 'none',
				fontSize: `${size * 0.75}px`,
				height: `${size}px`,
				lineHeight: `${size}px`,
				textAlign: 'center',
				width: `${size}px`,
			}) as const,
		[size],
	)

	return (
		<div
			className={'color-icon'}
			data-background-color={backgroundColor}
			data-text-color={textColor}
			style={style}
		>
			A
		</div>
	)
}
