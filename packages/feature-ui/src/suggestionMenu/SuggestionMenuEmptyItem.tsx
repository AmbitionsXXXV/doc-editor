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
				'bn-relative bn-flex bn-cursor-default bn-select-none bn-items-center bn-rounded-sm bn-px-2 bn-py-1.5 bn-text-sm bn-outline-none bn-transition-colors focus:bn-bg-accent focus:bn-text-accent-foreground data-[disabled]:bn-pointer-events-none data-[disabled]:bn-opacity-50',
				className,
			)}
			ref={ref}
		>
			<div>{children}</div>
		</div>
	)
}
