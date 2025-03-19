import { Dictionary } from '@doc-editor/core'

import { useEtcDocContext } from '@/editor/EtcDocContext'

export function useDictionary(): Dictionary {
	const ctx = useEtcDocContext()

	if (!ctx?.editor) {
		throw new Error(
			'useDictionary was called outside of a EtcDocContext provider or EtcDocView component',
		)
	}

	return ctx.editor.dictionary
}
