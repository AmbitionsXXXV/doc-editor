import {
	DefaultBlockSchema,
	DefaultInlineContentSchema,
	DefaultStyleSchema,
	InlineContentSchema,
	SpecificBlock,
	StyleSchema,
} from '@doc-editor/core'

export type TableHandleMenuProps<
	I extends InlineContentSchema = DefaultInlineContentSchema,
	S extends StyleSchema = DefaultStyleSchema,
> = {
	orientation: 'row' | 'column'
	block: SpecificBlock<{ table: DefaultBlockSchema['table'] }, 'table', I, S>
	index: number
}
