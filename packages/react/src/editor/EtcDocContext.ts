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
import { createContext, useContext, useState } from 'react'

type EtcDocContextValue<
	BSchema extends BlockSchema = DefaultBlockSchema,
	ISchema extends InlineContentSchema = DefaultInlineContentSchema,
	SSchema extends StyleSchema = DefaultStyleSchema,
> = {
	setContentEditableProps?: ReturnType<typeof useState<Record<string, any>>>[1] // copy type of setXXX from useState
	editor?: EtcDocEditor<BSchema, ISchema, SSchema>
	colorSchemePreference?: 'light' | 'dark'
}

export const EtcDocContext = createContext<EtcDocContextValue | undefined>(undefined)

/**
 * Get the EtcDocContext instance from the nearest EtcDocContext provider
 * @param _schema: optional, pass in the schema to return type-safe Context if you're using a custom schema
 */
export function useEtcDocContext<
	BSchema extends BlockSchema = DefaultBlockSchema,
	ISchema extends InlineContentSchema = DefaultInlineContentSchema,
	SSchema extends StyleSchema = DefaultStyleSchema,
>(
	_schema?: EtcDocSchema<BSchema, ISchema, SSchema>,
): EtcDocContextValue<BSchema, ISchema, SSchema> | undefined {
	const context = useContext(EtcDocContext) as any

	return context
}
