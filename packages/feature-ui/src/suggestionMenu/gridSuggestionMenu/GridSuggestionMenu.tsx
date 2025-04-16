import { assertEmpty } from '@doc-editor/core'
import { ComponentProps } from '@doc-editor/react'
import React from 'react'

export function GridSuggestionMenu(
	props: ComponentProps['GridSuggestionMenu']['Root'] & {
		ref?: React.Ref<HTMLDivElement>
	},
) {
	const { className, children, id, columns, ref, ...rest } = props

	assertEmpty(rest)

	return (
		<div
			className={className}
			style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` } as any}
			ref={ref}
			id={id}
			role="grid"
		>
			{children}
		</div>
	)
}
