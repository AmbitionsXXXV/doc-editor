import { useEffect } from 'react'

import { useEtcDocEditor } from './useEtcDocEditor'

export function useOnUploadStart(callback: (blockId?: string) => void) {
	const editor = useEtcDocEditor()

	useEffect(() => {
		return editor.onUploadStart(callback)
	}, [callback, editor])
}
