import { Dictionary } from '@doc-editor/core'

import { useEtcDocContext } from '../editor/EtcDocContext'

export function useDictionary(): Dictionary {
	const ctx = useEtcDocContext()
	return ctx!.editor!.dictionary
}
