import {
	BlockSchema,
	DefaultBlockSchema,
	DefaultInlineContentSchema,
	DefaultStyleSchema,
	EtcDocEditor,
	EtcDocSchema,
	InlineContentSchema,
	StyleSchema,
} from '@doc-editor/core'

import { useEtcDocContext } from '../editor/EtcDocContext'

/**
 * Get the EtcDocEditor instance from the nearest EtcDocContext provider
 * @param _schema: optional, pass in the schema to return type-safe EtcDocEditor if you're using a custom schema
 */
export function useEtcDocEditor<
	BSchema extends BlockSchema = DefaultBlockSchema,
	ISchema extends InlineContentSchema = DefaultInlineContentSchema,
	SSchema extends StyleSchema = DefaultStyleSchema,
>(
	_schema?: EtcDocSchema<BSchema, ISchema, SSchema>,
): EtcDocEditor<BSchema, ISchema, SSchema> {
	const context = useEtcDocContext(_schema)

	if (!context?.editor) {
		throw new Error(
			'useEtcDocEditor was called outside of a EtcDocContext provider or EtcDocView component',
		)
	}

	return context.editor
}
