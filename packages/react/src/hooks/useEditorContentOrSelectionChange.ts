import type { EtcDocEditor } from '@doc-editor/core'

import { useEditorChange } from './useEditorChange'
import { useEditorSelectionChange } from './useEditorSelectionChange'

export function useEditorContentOrSelectionChange(
	callback: () => void,
	editor?: EtcDocEditor<any, any, any>,
) {
	useEditorChange(callback, editor)
	useEditorSelectionChange(callback, editor)
}
