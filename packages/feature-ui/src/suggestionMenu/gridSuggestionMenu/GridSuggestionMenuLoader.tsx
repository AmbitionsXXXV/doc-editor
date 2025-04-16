import { assertEmpty } from '@doc-editor/core'
import { ComponentProps } from '@doc-editor/react'
import React from 'react'

export function GridSuggestionMenuLoader(
	props: ComponentProps['GridSuggestionMenu']['Loader'] & {
		ref?: React.Ref<HTMLDivElement>
	},
) {
	const {
		className,
		children, // unused, using "dots" instead
		columns,
		ref,
		...rest
	} = props

	assertEmpty(rest)

	return (
		<div
			className={className}
			style={{ gridColumn: `1 / ${columns + 1}` }}
			ref={ref}
		>
			{children}
		</div>
	)
}
