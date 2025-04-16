import { assertEmpty } from '@doc-editor/core'
import { ComponentProps } from '@doc-editor/react'
import React from 'react'

export function GridSuggestionMenuEmptyItem(
	props: ComponentProps['GridSuggestionMenu']['EmptyItem'] & {
		ref?: React.Ref<HTMLDivElement>
	},
) {
	const { className, children, columns, ref, ...rest } = props

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
