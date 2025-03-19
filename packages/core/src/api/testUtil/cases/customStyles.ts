import { uploadToTmpFilesDotOrg_DEV_ONLY } from '@/blocks/FileBlockContent/uploadToTmpFilesDotOrg_DEV_ONLY'
import {
	DefaultBlockSchema,
	DefaultInlineContentSchema,
	defaultStyleSpecs,
} from '@/blocks/defaultBlocks'
import { EtcDocEditor } from '@/editor/EtcDocEditor'
import { EtcDocSchema } from '@/editor/EtcDocSchema'
import { createStyleSpec } from '@/schema/styles/createSpec'
import { EditorTestCases } from '../index'

const small = createStyleSpec(
	{
		type: 'small',
		propSchema: 'boolean',
	},
	{
		render: () => {
			const dom = document.createElement('small')
			return {
				dom,
				contentDOM: dom,
			}
		},
	},
)

const fontSize = createStyleSpec(
	{
		type: 'fontSize',
		propSchema: 'string',
	},
	{
		render: (value) => {
			const dom = document.createElement('span')
			dom.setAttribute('style', `font-size: ${value}`)
			return {
				dom,
				contentDOM: dom,
			}
		},
	},
)

const schema = EtcDocSchema.create({
	styleSpecs: {
		...defaultStyleSpecs,
		small,
		fontSize,
	},
})

export const customStylesTestCases: EditorTestCases<
	DefaultBlockSchema,
	DefaultInlineContentSchema,
	typeof schema.styleSchema
> = {
	name: 'custom style schema',
	createEditor: () => {
		return EtcDocEditor.create({
			uploadFile: uploadToTmpFilesDotOrg_DEV_ONLY,
			schema,
		})
	},
	documents: [
		{
			name: 'small/basic',
			blocks: [
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'This is a small text',
							styles: {
								small: true,
							},
						},
					],
				},
			],
		},
		{
			name: 'fontSize/basic',
			blocks: [
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'This is text with a custom fontSize',
							styles: {
								fontSize: '18px',
							},
						},
					],
				},
			],
		},
	],
}
