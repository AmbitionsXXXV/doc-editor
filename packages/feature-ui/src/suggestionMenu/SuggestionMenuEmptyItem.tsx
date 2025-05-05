import { assertEmpty } from '@doc-editor/core'
import { ComponentProps } from '@doc-editor/react'
import React from 'react'

import { cn } from '@doc-editor/ui/lib/utils'

export function SuggestionMenuEmptyItem(
	props: ComponentProps['SuggestionMenu']['EmptyItem'] & {
		ref?: React.Ref<HTMLDivElement>
	},
) {
	const { className, children, ref, ...rest } = props

	assertEmpty(rest)

	return (
		<div
			className={cn(
				'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
				className,
			)}
			ref={ref}
		>
			<div>{children}</div>
		</div>
	)
}
