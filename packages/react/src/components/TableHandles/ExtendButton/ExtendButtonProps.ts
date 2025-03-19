import {
	DefaultBlockSchema,
	DefaultInlineContentSchema,
	DefaultStyleSchema,
	EtcDocEditor,
	InlineContentSchema,
	StyleSchema,
	TableHandlesState,
} from '@doc-editor/core'

export type ExtendButtonProps<
	I extends InlineContentSchema = DefaultInlineContentSchema,
	S extends StyleSchema = DefaultStyleSchema,
> = {
	editor: EtcDocEditor<
		{
			table: DefaultBlockSchema['table']
		},
		I,
		S
	>
	onMouseDown: () => void
	onMouseUp: () => void
	orientation: 'addOrRemoveRows' | 'addOrRemoveColumns'
} & Pick<TableHandlesState<I, S>, 'block'>
