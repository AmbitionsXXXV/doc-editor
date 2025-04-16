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
				'bn-p-0 bn-h-full bn-w-full bn-text-gray-400',
				className?.includes('bn-extend-button-add-remove-columns')
					? 'bn-ml-1'
					: 'bn-mt-1',
				className?.includes('bn-extend-button-editing')
					? 'bn-bg-accent bn-text-accent-foreground'
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
