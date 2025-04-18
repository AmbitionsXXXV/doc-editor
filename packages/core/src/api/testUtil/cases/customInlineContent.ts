import { uploadToTmpFilesDotOrg_DEV_ONLY } from '@/blocks/FileBlockContent/uploadToTmpFilesDotOrg_DEV_ONLY'
import {
	DefaultBlockSchema,
	DefaultStyleSchema,
	defaultInlineContentSpecs,
} from '@/blocks/defaultBlocks'
import { EtcDocEditor } from '@/editor/EtcDocEditor'
import { EtcDocSchema } from '@/editor/EtcDocSchema'
import { createInlineContentSpec } from '@/schema/inlineContent/createSpec'
import { EditorTestCases } from '../index'

const mention = createInlineContentSpec(
	{
		type: 'mention' as const,
		propSchema: {
			user: {
				default: '',
			},
		},
		content: 'none',
	},
	{
		render: (ic) => {
			const dom = document.createElement('span')
			dom.appendChild(document.createTextNode(`@${ic.props.user}`))

			return {
				dom,
			}
		},
	},
)

const tag = createInlineContentSpec(
	{
		type: 'tag' as const,
		propSchema: {},
		content: 'styled',
	},
	{
		render: () => {
			const dom = document.createElement('span')
			dom.textContent = '#'

			const contentDOM = document.createElement('span')
			dom.appendChild(contentDOM)

			return {
				dom,
				contentDOM,
			}
		},
	},
)

const schema = EtcDocSchema.create({
	inlineContentSpecs: {
		...defaultInlineContentSpecs,
		mention,
		tag,
	},
})

export const customInlineContentTestCases: EditorTestCases<
	DefaultBlockSchema,
	typeof schema.inlineContentSchema,
	DefaultStyleSchema
> = {
	name: 'custom inline content schema',
	createEditor: () => {
		return EtcDocEditor.create({
			uploadFile: uploadToTmpFilesDotOrg_DEV_ONLY,
			schema,
		})
	},
	documents: [
		{
			name: 'mention/basic',
			blocks: [
				{
					type: 'paragraph',
					content: [
						'I enjoy working with ',
						{
							type: 'mention',
							props: {
								user: 'Matthew',
							},
							content: undefined,
						},
					],
				},
			],
		},
		{
			name: 'tag/basic',
			blocks: [
				{
					type: 'paragraph',
					content: [
						'I love ',
						{
							type: 'tag',
							// props: {},
							content: 'EtcDoc',
						},
					],
				},
			],
		},
	],
}
