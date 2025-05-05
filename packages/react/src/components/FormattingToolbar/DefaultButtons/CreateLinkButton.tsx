import {
	BlockSchema,
	EtcDocEditor,
	InlineContentSchema,
	StyleSchema,
	formatKeyboardShortcut,
} from '@doc-editor/core'
import { useCallback, useMemo, useState } from 'react'
import { RiLink } from 'react-icons/ri'

import { EditLinkMenuItems } from '@/components/LinkToolbar/EditLinkMenuItems'
import { useComponentsContext } from '@/editor/ComponentsContext'
import { useEditorContentOrSelectionChange } from '@/hooks/useEditorContentOrSelectionChange'
import { useEtcDocEditor } from '@/hooks/useEtcDocEditor'
import { useSelectedBlocks } from '@/hooks/useSelectedBlocks'
import { useDictionary } from '@/i18n/dictionary'

function checkLinkInSchema(
	editor: EtcDocEditor<BlockSchema, any, StyleSchema>,
): editor is EtcDocEditor<
	BlockSchema,
	{
		link: {
			type: 'link'
			propSchema: any
			content: 'styled'
		}
	},
	StyleSchema
> {
	return (
		'link' in editor.schema.inlineContentSchema &&
		editor.schema.inlineContentSchema['link'] === 'link'
	)
}

export const CreateLinkButton = () => {
	const editor = useEtcDocEditor<BlockSchema, InlineContentSchema, StyleSchema>()
	const Components = useComponentsContext()!
	const dict = useDictionary()

	const linkInSchema = checkLinkInSchema(editor)

	const selectedBlocks = useSelectedBlocks(editor)

	const [url, setUrl] = useState<string>(editor.getSelectedLinkUrl() || '')
	const [text, setText] = useState<string>(editor.getSelectedText())

	useEditorContentOrSelectionChange(() => {
		setText(editor.getSelectedText() || '')
		setUrl(editor.getSelectedLinkUrl() || '')
	}, editor)

	const update = useCallback(
		(url: string, text: string) => {
			editor.createLink(url, text)
			editor.focus()
		},
		[editor],
	)

	const show = useMemo(() => {
		if (!linkInSchema) {
			return false
		}

		for (const block of selectedBlocks) {
			if (block.content === undefined) {
				return false
			}
		}

		return true
	}, [linkInSchema, selectedBlocks])

	if (
		!show ||
		!('link' in editor.schema.inlineContentSchema) ||
		!editor.isEditable
	) {
		return null
	}

	return (
		<Components.Generic.Popover.Root>
			<Components.Generic.Popover.Trigger>
				{/* TODO: hide tooltip on click */}
				<Components.FormattingToolbar.Button
					className={'button'}
					data-test="createLink"
					label={dict.formatting_toolbar.link.tooltip}
					mainTooltip={dict.formatting_toolbar.link.tooltip}
					secondaryTooltip={formatKeyboardShortcut(
						dict.formatting_toolbar.link.secondary_tooltip,
						dict.generic.ctrl_shortcut,
					)}
					icon={<RiLink />}
				/>
			</Components.Generic.Popover.Trigger>
			<Components.Generic.Popover.Content
				className={'popover-content form-popover'}
				variant={'form-popover'}
			>
				<EditLinkMenuItems url={url} text={text} editLink={update} />
			</Components.Generic.Popover.Content>
		</Components.Generic.Popover.Root>
	)
}
