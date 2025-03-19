import {
	BlockSchema,
	DefaultBlockSchema,
	DefaultInlineContentSchema,
	DefaultStyleSchema,
	InlineContentSchema,
	StyleSchema,
} from '@doc-editor/core'
import { flip, offset } from '@floating-ui/react'
import { FC } from 'react'

import { useEtcDocEditor } from '@/hooks/useEtcDocEditor'
import { useUIElementPositioning } from '@/hooks/useUIElementPositioning'
import { useUIPluginState } from '@/hooks/useUIPluginState'
import { LinkToolbar } from './LinkToolbar'
import { LinkToolbarProps } from './LinkToolbarProps'

export const LinkToolbarController = <
	BSchema extends BlockSchema = DefaultBlockSchema,
	I extends InlineContentSchema = DefaultInlineContentSchema,
	S extends StyleSchema = DefaultStyleSchema,
>(props: {
	linkToolbar?: FC<LinkToolbarProps>
}) => {
	const editor = useEtcDocEditor<BSchema, I, S>()

	const callbacks = {
		deleteLink: editor.linkToolbar.deleteLink,
		editLink: editor.linkToolbar.editLink,
		startHideTimer: editor.linkToolbar.startHideTimer,
		stopHideTimer: editor.linkToolbar.stopHideTimer,
	}

	const state = useUIPluginState(
		editor.linkToolbar.onUpdate.bind(editor.linkToolbar),
	)
	const { isMounted, ref, style, getFloatingProps } = useUIElementPositioning(
		state?.show || false,
		state?.referencePos || null,
		4000,
		{
			placement: 'top-start',
			middleware: [offset(10), flip()],
			onOpenChange: (open) => {
				if (!open) {
					editor.linkToolbar.closeMenu()
					editor.focus()
				}
			},
		},
	)

	if (!isMounted || !state) {
		return null
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { show, referencePos, ...data } = state

	const Component = props.linkToolbar || LinkToolbar

	return (
		<div ref={ref} style={style} {...getFloatingProps()}>
			<Component {...data} {...callbacks} />
		</div>
	)
}
