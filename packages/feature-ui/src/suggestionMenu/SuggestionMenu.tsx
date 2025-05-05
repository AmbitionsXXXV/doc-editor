import { assertEmpty } from '@doc-editor/core'
import { ComponentProps } from '@doc-editor/react'
import React from 'react'
import { SuggestionMenuEmptyItem } from './SuggestionMenuEmptyItem'
import { SuggestionMenuItem } from './SuggestionMenuItem'
import { SuggestionMenuLabel } from './SuggestionMenuLabel'
import { SuggestionMenuLoader } from './SuggestionMenuLoader'

import { cn } from '@doc-editor/ui/lib/utils'

function SuggestionMenuRoot(
	props: ComponentProps['SuggestionMenu']['Root'] & {
		ref?: React.Ref<HTMLDivElement>
	},
) {
	const { className, children, id, ref, ...rest } = props
	assertEmpty(rest)
	return (
		<div
			id={id}
			role="listbox"
			className={cn(
				'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-[200px] min-w-[8rem] overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in',
				className,
			)}
			ref={ref}
		>
			{children}
		</div>
	)
}

export const SuggestionMenu = {
	Root: SuggestionMenuRoot,
	Item: SuggestionMenuItem,
	EmptyItem: SuggestionMenuEmptyItem,
	Label: SuggestionMenuLabel,
	Loader: SuggestionMenuLoader,
}
