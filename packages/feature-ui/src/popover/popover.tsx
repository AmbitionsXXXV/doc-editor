import { assertEmpty } from '@doc-editor/core'
import { ComponentProps } from '@doc-editor/react'
import { forwardRef } from 'react'

import { cn } from '@doc-editor/ui/lib/utils'
import { useShadCNComponentsContext } from '../ShadCNComponentsContext'

export const Popover = (props: ComponentProps['Generic']['Popover']['Root']) => {
	const {
		children,
		opened,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		position, // unused
		...rest
	} = props

	assertEmpty(rest)

	const ShadCNComponents = useShadCNComponentsContext()!

	return (
		<ShadCNComponents.Popover.Popover open={opened}>
			{children}
		</ShadCNComponents.Popover.Popover>
	)
}

export const PopoverTrigger = forwardRef(
	(props: ComponentProps['Generic']['Popover']['Trigger'], ref: any) => {
		const { children, ...rest } = props

		assertEmpty(rest)

		const ShadCNComponents = useShadCNComponentsContext()!

		return (
			<ShadCNComponents.Popover.PopoverTrigger ref={ref} asChild={true}>
				{children}
			</ShadCNComponents.Popover.PopoverTrigger>
		)
	},
)

export const PopoverContent = forwardRef<
	HTMLDivElement,
	ComponentProps['Generic']['Popover']['Content']
>((props, ref) => {
	const { className, variant, children, ...rest } = props

	assertEmpty(rest)

	const ShadCNComponents = useShadCNComponentsContext()!

	return (
		<ShadCNComponents.Popover.PopoverContent
			sideOffset={8}
			className={cn(
				className,
				'flex flex-col gap-2',
				variant === 'panel-popover'
					? 'w-fit max-w-none border-none p-0 shadow-none'
					: '',
			)}
			ref={ref}
		>
			{children}
		</ShadCNComponents.Popover.PopoverContent>
	)
})
