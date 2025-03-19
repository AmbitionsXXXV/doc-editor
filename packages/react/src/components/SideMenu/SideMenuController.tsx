import {
	BlockSchema,
	DefaultBlockSchema,
	DefaultInlineContentSchema,
	DefaultStyleSchema,
	InlineContentSchema,
	StyleSchema,
} from '@doc-editor/core'
import { FC } from 'react'

import { useEtcDocEditor } from '../../hooks/useEtcDocEditor'
import { useUIElementPositioning } from '../../hooks/useUIElementPositioning'
import { useUIPluginState } from '../../hooks/useUIPluginState'
import { SideMenu } from './SideMenu'
import { SideMenuProps } from './SideMenuProps'

export const SideMenuController = <
	BSchema extends BlockSchema = DefaultBlockSchema,
	I extends InlineContentSchema = DefaultInlineContentSchema,
	S extends StyleSchema = DefaultStyleSchema,
>(props: {
	sideMenu?: FC<SideMenuProps<BSchema, I, S>>
}) => {
	const editor = useEtcDocEditor<BSchema, I, S>()

	const callbacks = {
		blockDragStart: editor.sideMenu.blockDragStart,
		blockDragEnd: editor.sideMenu.blockDragEnd,
		freezeMenu: editor.sideMenu.freezeMenu,
		unfreezeMenu: editor.sideMenu.unfreezeMenu,
	}

	const state = useUIPluginState(editor.sideMenu.onUpdate.bind(editor.sideMenu))
	const { isMounted, ref, style, getFloatingProps } = useUIElementPositioning(
		state?.show || false,
		state?.referencePos || null,
		1000,
		{
			placement: 'left-start',
		},
	)

	if (!isMounted || !state) {
		return null
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { show, referencePos, ...data } = state

	const Component = props.sideMenu || SideMenu

	return (
		<div ref={ref} style={style} {...getFloatingProps()}>
			<Component {...data} {...callbacks} editor={editor} />
		</div>
	)
}
