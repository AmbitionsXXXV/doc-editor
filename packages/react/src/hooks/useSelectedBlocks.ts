import {
	Block,
	BlockSchema,
	EtcDocEditor,
	InlineContentSchema,
	StyleSchema,
} from '@doc-editor/core'
import { useState } from 'react'

import { useEtcDocContext } from '../editor/EtcDocContext'
import { useEditorContentOrSelectionChange } from './useEditorContentOrSelectionChange'

export function useSelectedBlocks<
	BSchema extends BlockSchema,
	ISchema extends InlineContentSchema,
	SSchema extends StyleSchema,
>(editor?: EtcDocEditor<BSchema, ISchema, SSchema>) {
	const editorContext = useEtcDocContext<BSchema, ISchema, SSchema>()
	if (!editor) {
		editor = editorContext?.editor
	}

	if (!editor) {
		throw new Error(
			"'editor' is required, either from EtcDocContext or as a function argument",
		)
	}

	const e = editor

	const [selectedBlocks, setSelectedBlocks] = useState<
		Block<BSchema, ISchema, SSchema>[]
	>(() => e.getSelection()?.blocks || [e.getTextCursorPosition().block])

	useEditorContentOrSelectionChange(
		() =>
			setSelectedBlocks(
				e.getSelection()?.blocks || [e.getTextCursorPosition().block],
			),
		e,
	)

	return selectedBlocks
}
