import { assertEmpty } from '@doc-editor/core'
import { ComponentProps } from '@doc-editor/react'
import React from 'react'

export function SideMenu(
	props: ComponentProps['SideMenu']['Root'] & {
		ref?: React.Ref<HTMLDivElement>
	},
) {
	const { className, children, ref, ...rest } = props

	assertEmpty(rest, false)

	return (
		<div className={className} ref={ref} {...rest}>
			{children}
		</div>
	)
}
