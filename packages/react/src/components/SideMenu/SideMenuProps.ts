import {
	BlockSchema,
	DefaultBlockSchema,
	DefaultInlineContentSchema,
	DefaultStyleSchema,
	EtcDocEditor,
	InlineContentSchema,
	SideMenuState,
	StyleSchema,
	UiElementPosition,
} from '@doc-editor/core'
import { FC } from 'react'

import { DragHandleMenuProps } from './DragHandleMenu/DragHandleMenuProps'

export type SideMenuProps<
	BSchema extends BlockSchema = DefaultBlockSchema,
	I extends InlineContentSchema = DefaultInlineContentSchema,
	S extends StyleSchema = DefaultStyleSchema,
> = {
	editor: EtcDocEditor<BSchema, I, S>
	dragHandleMenu?: FC<DragHandleMenuProps<BSchema, I, S>>
} & Omit<SideMenuState<BSchema, I, S>, keyof UiElementPosition> &
	Pick<
		EtcDocEditor<BSchema, I, S>['sideMenu'],
		'blockDragStart' | 'blockDragEnd' | 'freezeMenu' | 'unfreezeMenu'
	>
