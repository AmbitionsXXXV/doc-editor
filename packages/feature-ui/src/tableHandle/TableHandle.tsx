import { assertEmpty } from '@doc-editor/core'
import { ComponentProps } from '@doc-editor/react'
import React from 'react'

import { cn } from '@doc-editor/ui/lib/utils'
import { useShadCNComponentsContext } from '../ShadCNComponentsContext'

export function TableHandle(
	props: ComponentProps['TableHandle']['Root'] & {
		ref?: React.Ref<HTMLButtonElement>
	},
) {
	const {
		className,
		children,
		draggable,
		onDragStart,
		onDragEnd,
		style,
		label,
		ref,
		...rest
	} = props

	// false, because rest props can be added by shadcn when button is used as a trigger
	// assertEmpty in this case is only used at typescript level, not runtime level
	assertEmpty(rest, false)

	const ShadCNComponents = useShadCNComponentsContext()!

	return (
		<ShadCNComponents.Button.Button
			variant={'ghost'}
			className={cn(className, 'h-fit w-fit p-0 text-gray-400')}
			ref={ref}
			aria-label={label}
			draggable={draggable}
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
			style={style}
			{...rest}
		>
			{children}
		</ShadCNComponents.Button.Button>
	)
}
