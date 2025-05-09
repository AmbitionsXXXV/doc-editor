import {
	BlockSchema,
	InlineContentSchema,
	StyleSchema,
	checkBlockIsFileBlock,
	checkBlockIsFileBlockWithPlaceholder,
} from '@doc-editor/core'
import { useCallback, useMemo } from 'react'
import { RiDownload2Fill } from 'react-icons/ri'

import { useComponentsContext } from '@/editor/ComponentsContext'
import { useEtcDocEditor } from '@/hooks/useEtcDocEditor'
import { useSelectedBlocks } from '@/hooks/useSelectedBlocks'
import { useDictionary } from '@/i18n/dictionary'
import { sanitizeUrl } from '@/util/sanitizeUrl'

export const FileDownloadButton = () => {
	const dict = useDictionary()
	const Components = useComponentsContext()!

	const editor = useEtcDocEditor<BlockSchema, InlineContentSchema, StyleSchema>()

	const selectedBlocks = useSelectedBlocks(editor)

	const fileBlock = useMemo(() => {
		// Checks if only one block is selected.
		if (selectedBlocks.length !== 1) {
			return undefined
		}

		const block = selectedBlocks[0]

		if (checkBlockIsFileBlock(block, editor)) {
			return block
		}

		return undefined
	}, [editor, selectedBlocks])

	const onClick = useCallback(() => {
		if (fileBlock?.props.url) {
			editor.focus()
			editor
				.resolveFileUrl(fileBlock.props.url)
				.then((downloadUrl) =>
					window.open(sanitizeUrl(downloadUrl, window.location.href)),
				)
		}
	}, [editor, fileBlock])

	if (!fileBlock || checkBlockIsFileBlockWithPlaceholder(fileBlock, editor)) {
		return null
	}

	return (
		<Components.FormattingToolbar.Button
			className={'button'}
			label={
				dict.formatting_toolbar.file_download.tooltip[fileBlock.type] ||
				dict.formatting_toolbar.file_download.tooltip['file']
			}
			mainTooltip={
				dict.formatting_toolbar.file_download.tooltip[fileBlock.type] ||
				dict.formatting_toolbar.file_download.tooltip['file']
			}
			icon={<RiDownload2Fill />}
			onClick={onClick}
		/>
	)
}
