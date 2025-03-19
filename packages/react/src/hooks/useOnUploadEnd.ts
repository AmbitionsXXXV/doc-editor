import { useEffect } from 'react'

import { useEtcDocEditor } from './useEtcDocEditor'

export function useOnUploadEnd(callback: (blockId?: string) => void) {
	const editor = useEtcDocEditor()

	useEffect(() => {
		return editor.onUploadEnd(callback)
	}, [callback, editor])
}
