import type { EtcDocEditor } from '@doc-editor/core'
import { useEffect } from 'react'

import { useEtcDocContext } from '../editor/EtcDocContext'

export function useEditorSelectionChange(
	callback: () => void,
	editor?: EtcDocEditor<any, any, any>,
) {
	const editorContext = useEtcDocContext()
	if (!editor) {
		editor = editorContext?.editor
	}

	useEffect(() => {
		if (!editor) {
			throw new Error(
				"'editor' is required, either from EtcDocContext or as a function argument",
			)
		}
		return editor.onSelectionChange(callback)
	}, [callback, editor])
}
