import { assertEmpty } from '@doc-editor/core'
import { ComponentProps } from '@doc-editor/react'
import React from 'react'

import { cn } from '@doc-editor/ui/lib/utils'
import { useShadCNComponentsContext } from '../ShadCNComponentsContext'

export function ExtendButton(
	props: ComponentProps['TableHandle']['ExtendButton'] & {
		ref?: React.Ref<HTMLButtonElement>
	},
) {
	const { className, children, onMouseDown, onClick, ref, ...rest } = props

	// false, because rest props can be added by shadcn when button is used as a trigger
	// assertEmpty in this case is only used at typescript level, not runtime level
	assertEmpty(rest, false)

	const ShadCNComponents = useShadCNComponentsContext()!

	return (
		<ShadCNComponents.Button.Button
			variant={'ghost'}
			className={cn(
				className,
				'h-full w-full p-0 text-gray-400',
				className?.includes('extend-button-add-remove-columns') ? 'ml-1' : 'mt-1',
				className?.includes('extend-button-editing')
					? 'bg-accent text-accent-foreground'
					: '',
			)}
			ref={ref}
			onClick={onClick}
			onMouseDown={onMouseDown}
			{...rest}
		>
			{children}
		</ShadCNComponents.Button.Button>
	)
}
