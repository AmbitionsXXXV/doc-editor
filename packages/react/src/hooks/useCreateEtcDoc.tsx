import {
	BlockSchema,
	DefaultBlockSchema,
	DefaultInlineContentSchema,
	DefaultStyleSchema,
	EtcDocEditor,
	EtcDocEditorOptions,
	InlineContentSchema,
	StyleSchema,
} from '@doc-editor/core'
import { DependencyList, useMemo } from 'react'

/**
 * Main hook for importing a EtcDoc editor into a React project
 *
 * TODO: document in docs
 */
export const useCreateEtcDoc = <
	BSchema extends BlockSchema = DefaultBlockSchema,
	ISchema extends InlineContentSchema = DefaultInlineContentSchema,
	SSchema extends StyleSchema = DefaultStyleSchema,
>(
	options: Partial<EtcDocEditorOptions<BSchema, ISchema, SSchema>> = {},
	deps: DependencyList = [],
) => {
	return useMemo(() => {
		const editor = EtcDocEditor.create<BSchema, ISchema, SSchema>(options)
		if (window) {
			// for testing / dev purposes
			;(window as any).ProseMirror = editor._tiptapEditor
		}
		return editor
	}, deps)
}

/**
 * @deprecated use useCreateEtcDoc instead
 */
export const useEtcDoc = useCreateEtcDoc
