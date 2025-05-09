import './styles.css'

import {
	BlockSchema,
	EtcDocEditor,
	InlineContentSchema,
	StyleSchema,
	mergeCSSClasses,
} from '@doc-editor/core'
import React, {
	HTMLAttributes,
	ReactNode,
	Ref,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react'

import { useEditorChange } from '@/hooks/useEditorChange'
import { useEditorSelectionChange } from '@/hooks/useEditorSelectionChange'
import { usePrefersColorScheme } from '@/hooks/usePrefersColorScheme'
import { EditorContent } from './EditorContent'
import { ElementRenderer } from './ElementRenderer'
import { EtcDocContext, useEtcDocContext } from './EtcDocContext'
import { EtcDocDefaultUI, EtcDocDefaultUIProps } from './EtcDocDefaultUI'

const emptyFn = () => {
	// noop
}

export type EtcDocViewProps<
	BSchema extends BlockSchema,
	ISchema extends InlineContentSchema,
	SSchema extends StyleSchema,
> = {
	editor: EtcDocEditor<BSchema, ISchema, SSchema>

	theme?: 'light' | 'dark'

	/**
	 * Locks the editor from being editable by the user if set to `false`.
	 */
	editable?: boolean
	/**
	 * A callback function that runs whenever the text cursor position or selection changes.
	 */
	onSelectionChange?: () => void

	/**
	 * A callback function that runs whenever the editor's contents change.
	 */
	onChange?: () => void

	children?: ReactNode

	ref?: Ref<HTMLDivElement> | undefined // only here to get types working with the generics. Regular form doesn't work
} & Omit<
	HTMLAttributes<HTMLDivElement>,
	'onChange' | 'onSelectionChange' | 'children'
> &
	EtcDocDefaultUIProps

function EtcDocViewComponent<
	BSchema extends BlockSchema,
	ISchema extends InlineContentSchema,
	SSchema extends StyleSchema,
>(
	props: EtcDocViewProps<BSchema, ISchema, SSchema> & {
		ref?: React.Ref<HTMLDivElement>
	},
) {
	const {
		editor,
		className,
		theme,
		children,
		editable,
		onSelectionChange,
		onChange,
		formattingToolbar,
		linkToolbar,
		slashMenu,
		emojiPicker,
		sideMenu,
		filePanel,
		tableHandles,
		ref,
		...rest
	} = props

	// Used so other components (suggestion menu) can set
	// aria related props to the contenteditable div
	const [contentEditableProps, setContentEditableProps] =
		useState<Record<string, any>>()

	const existingContext = useEtcDocContext()
	const systemColorScheme = usePrefersColorScheme()
	const defaultColorScheme =
		existingContext?.colorSchemePreference || systemColorScheme

	const editorColorScheme =
		theme || (defaultColorScheme === 'dark' ? 'dark' : 'light')

	useEditorChange(onChange || emptyFn, editor)
	useEditorSelectionChange(onSelectionChange || emptyFn, editor)

	useEffect(() => {
		editor.isEditable = editable !== false
	}, [editable, editor])

	const renderChildren = useMemo(() => {
		return (
			<>
				{children}
				<EtcDocDefaultUI
					formattingToolbar={formattingToolbar}
					linkToolbar={linkToolbar}
					slashMenu={slashMenu}
					emojiPicker={emojiPicker}
					sideMenu={sideMenu}
					filePanel={filePanel}
					tableHandles={tableHandles}
				/>
			</>
		)
	}, [
		children,
		formattingToolbar,
		linkToolbar,
		slashMenu,
		emojiPicker,
		sideMenu,
		filePanel,
		tableHandles,
	])

	const context = useMemo(() => {
		return {
			...existingContext,
			editor,
			setContentEditableProps,
		}
	}, [existingContext, editor])

	const setElementRenderer = useCallback(
		(ref: (typeof editor)['elementRenderer']) => {
			editor.elementRenderer = ref
		},
		[editor],
	)

	return (
		<EtcDocContext value={context as any}>
			<ElementRenderer ref={setElementRenderer} />
			{!editor.headless && (
				<EditorContent editor={editor}>
					<div
						className={mergeCSSClasses(
							'container',
							editorColorScheme || '',
							className || '',
						)}
						data-color-scheme={editorColorScheme}
						{...rest}
						ref={ref}
					>
						<div
							aria-autocomplete="list"
							aria-haspopup="listbox"
							ref={editor.mount}
							{...contentEditableProps}
						/>
						{renderChildren}
					</div>
				</EditorContent>
			)}
		</EtcDocContext>
	)
}

export const EtcDocViewRaw = <
	BSchema extends BlockSchema,
	ISchema extends InlineContentSchema,
	SSchema extends StyleSchema,
>(
	props: EtcDocViewProps<BSchema, ISchema, SSchema>,
) => {
	const { ref, ...rest } = props
	return <EtcDocViewComponent {...rest} ref={ref} />
}
