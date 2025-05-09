import {
	BlockSchema,
	InlineContentSchema,
	StyleSchema,
	checkBlockIsFileBlockWithPlaceholder,
	checkBlockIsFileBlockWithPreview,
} from '@doc-editor/core'
import { useCallback, useMemo } from 'react'
import { RiImageAddFill } from 'react-icons/ri'

import { useComponentsContext } from '@/editor/ComponentsContext'
import { useEtcDocEditor } from '@/hooks/useEtcDocEditor'
import { useSelectedBlocks } from '@/hooks/useSelectedBlocks'
import { useDictionary } from '@/i18n/dictionary'

export const FilePreviewButton = () => {
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

		if (checkBlockIsFileBlockWithPreview(block, editor)) {
			return block
		}

		return undefined
	}, [editor, selectedBlocks])

	const onClick = useCallback(() => {
		if (fileBlock) {
			editor.updateBlock(fileBlock, {
				props: {
					showPreview: !fileBlock.props.showPreview as any, // TODO
				},
			})
		}
	}, [editor, fileBlock])

	if (
		!fileBlock ||
		checkBlockIsFileBlockWithPlaceholder(fileBlock, editor) ||
		!editor.isEditable
	) {
		return null
	}

	return (
		<Components.FormattingToolbar.Button
			className={'button'}
			label={'Toggle preview'}
			mainTooltip={dict.formatting_toolbar.file_preview_toggle.tooltip}
			icon={<RiImageAddFill />}
			isSelected={fileBlock.props.showPreview}
			onClick={onClick}
		/>
	)
}
