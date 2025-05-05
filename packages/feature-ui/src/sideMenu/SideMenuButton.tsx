import { assertEmpty } from '@doc-editor/core'
import { ComponentProps } from '@doc-editor/react'
import React from 'react'

import { cn } from '@doc-editor/ui/lib/utils'
import { useShadCNComponentsContext } from '../ShadCNComponentsContext'

export function SideMenuButton(
	props: ComponentProps['SideMenu']['Button'] & {
		ref?: React.Ref<HTMLButtonElement>
	},
) {
	const {
		className,
		children,
		icon,
		onClick,
		onDragEnd,
		onDragStart,
		draggable,
		label,
		ref,
		...rest
	} = props

	// false, because rest props can be added by ariakit when button is used as a trigger
	// assertEmpty in this case is only used at typescript level, not runtime level
	assertEmpty(rest, false)

	const ShadCNComponents = useShadCNComponentsContext()!

	return (
		<ShadCNComponents.Button.Button
			variant={'ghost'}
			className={cn(className, 'text-gray-400')}
			ref={ref}
			aria-label={label}
			onClick={onClick}
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
			draggable={draggable}
			{...rest}
		>
			{icon}
			{children}
		</ShadCNComponents.Button.Button>
	)
}
