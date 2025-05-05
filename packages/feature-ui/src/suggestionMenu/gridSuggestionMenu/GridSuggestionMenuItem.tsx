import { assertEmpty } from '@doc-editor/core'
import { ComponentProps, elementOverflow, mergeRefs } from '@doc-editor/react'
import React, { useEffect, useRef } from 'react'

export function GridSuggestionMenuItem(
	props: ComponentProps['GridSuggestionMenu']['Item'] & {
		ref?: React.Ref<HTMLDivElement>
	},
) {
	const { className, isSelected, onClick, item, id, ref, ...rest } = props

	assertEmpty(rest)

	const itemRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!itemRef.current || !isSelected) {
			return
		}

		const overflow = elementOverflow(
			itemRef.current,
			document.querySelector('.grid-suggestion-menu')!,
		)

		if (overflow === 'top') {
			itemRef.current.scrollIntoView(true)
		} else if (overflow === 'bottom') {
			itemRef.current.scrollIntoView(false)
		}
	}, [isSelected])

	return (
		<div
			className={className}
			ref={mergeRefs([ref, itemRef])}
			id={id}
			role="option"
			onClick={onClick}
			aria-selected={isSelected || undefined}
		>
			{item.icon}
		</div>
	)
}
