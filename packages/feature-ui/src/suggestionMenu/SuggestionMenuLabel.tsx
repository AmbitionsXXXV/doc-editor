import { assertEmpty } from '@doc-editor/core'
import { ComponentProps } from '@doc-editor/react'
import React from 'react'

import { cn } from '@doc-editor/ui/lib/utils'

export function SuggestionMenuLabel(
	props: ComponentProps['SuggestionMenu']['Label'] & {
		ref?: React.Ref<HTMLDivElement>
	},
) {
	const { className, children, ref, ...rest } = props

	assertEmpty(rest)

	return (
		<div className={cn('px-2 py-1.5 font-semibold text-sm', className)} ref={ref}>
			{children}
		</div>
	)
}
