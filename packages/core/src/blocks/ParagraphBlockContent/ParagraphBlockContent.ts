import { updateBlockCommand } from '@/api/blockManipulation/commands/updateBlock/updateBlock'
import { getBlockInfoFromSelection } from '@/api/getBlockInfoFromPos'
import { createDefaultBlockDOMOutputSpec } from '@/blocks/defaultBlockHelpers'
import { defaultProps } from '@/blocks/defaultProps'
import {
	createBlockSpecFromStronglyTypedTiptapNode,
	createStronglyTypedTiptapNode,
} from '@/schema/index'

export const paragraphPropSchema = {
	...defaultProps,
}

export const ParagraphBlockContent = createStronglyTypedTiptapNode({
	name: 'paragraph',
	content: 'inline*',
	group: 'blockContent',

	addKeyboardShortcuts() {
		return {
			'Mod-Alt-0': () => {
				const blockInfo = getBlockInfoFromSelection(this.editor.state)
				if (blockInfo.blockContent.node.type.spec.content !== 'inline*') {
					return true
				}

				return this.editor.commands.command(
					updateBlockCommand(
						this.options.editor,
						blockInfo.blockContainer.beforePos,
						{
							type: 'paragraph',
							props: {},
						},
					),
				)
			},
		}
	},

	parseHTML() {
		return [
			{ tag: `div[data-content-type=${this.name}]` },
			{
				tag: 'p',
				priority: 200,
				getAttrs: (element) => {
					if (typeof element === 'string' || !element.textContent?.trim()) {
						return false
					}

					return {}
				},
				node: 'paragraph',
			},
		]
	},

	renderHTML({ HTMLAttributes }) {
		return createDefaultBlockDOMOutputSpec(
			this.name,
			'p',
			{
				...(this.options.domAttributes?.blockContent || {}),
				...HTMLAttributes,
			},
			this.options.domAttributes?.inlineContent || {},
		)
	},
})

export const Paragraph = createBlockSpecFromStronglyTypedTiptapNode(
	ParagraphBlockContent,
	paragraphPropSchema,
)
