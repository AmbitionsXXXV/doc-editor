import { assertEmpty } from '@doc-editor/core'
import { ComponentProps } from '@doc-editor/react'
import React from 'react'

export function SuggestionMenuLoader(
	props: ComponentProps['SuggestionMenu']['Loader'] & {
		ref?: React.Ref<HTMLDivElement>
	},
) {
	const { className, children, ref, ...rest } = props

	assertEmpty(rest)

	return (
		<div className={className} ref={ref}>
			{children}
		</div>
	)
}
