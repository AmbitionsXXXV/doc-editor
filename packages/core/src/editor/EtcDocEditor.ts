import '../style.css'

import { EditorOptions, Extension, getSchema } from '@tiptap/core'
import { Transaction } from '@tiptap/pm/state'
import { Node, Schema } from 'prosemirror-model'
import * as Y from 'yjs'

import { insertBlocks } from '@/api/blockManipulation/commands/insertBlocks/insertBlocks'
import {
	moveBlockDown,
	moveBlockUp,
} from '@/api/blockManipulation/commands/moveBlock/moveBlock'
import { removeBlocks } from '@/api/blockManipulation/commands/removeBlocks/removeBlocks'
import { replaceBlocks } from '@/api/blockManipulation/commands/replaceBlocks/replaceBlocks'
import { updateBlock } from '@/api/blockManipulation/commands/updateBlock/updateBlock'
import { insertContentAt } from '@/api/blockManipulation/insertContentAt'
import {
	getTextCursorPosition,
	setTextCursorPosition,
} from '@/api/blockManipulation/selections/textCursorPosition/textCursorPosition'
import { createExternalHTMLExporter } from '@/api/exporters/html/externalHTMLExporter'
import { createInternalHTMLSerializer } from '@/api/exporters/html/internalHTMLSerializer'
import { blocksToMarkdown } from '@/api/exporters/markdown/markdownExporter'
import { getBlockInfoFromSelection } from '@/api/getBlockInfoFromPos'
import { inlineContentToNodes } from '@/api/nodeConversions/blockToNode'
import { nodeToBlock } from '@/api/nodeConversions/nodeToBlock'
import { HTMLToBlocks } from '@/api/parsers/html/parseHTML'
import { markdownToBlocks } from '@/api/parsers/markdown/parseMarkdown'
import { checkDefaultBlockTypeInSchema } from '@/blocks/defaultBlockTypeGuards'
import {
	Block,
	DefaultBlockSchema,
	DefaultInlineContentSchema,
	DefaultStyleSchema,
	PartialBlock,
} from '@/blocks/defaultBlocks'
import { FilePanelProsemirrorPlugin } from '@/extensions/FilePanel/FilePanelPlugin'
import { FormattingToolbarProsemirrorPlugin } from '@/extensions/FormattingToolbar/FormattingToolbarPlugin'
import { LinkToolbarProsemirrorPlugin } from '@/extensions/LinkToolbar/LinkToolbarPlugin'
import { NodeSelectionKeyboardPlugin } from '@/extensions/NodeSelectionKeyboard/NodeSelectionKeyboardPlugin'
import { PlaceholderPlugin } from '@/extensions/Placeholder/PlaceholderPlugin'
import { PreviousBlockTypePlugin } from '@/extensions/PreviousBlockType/PreviousBlockTypePlugin'
import { SideMenuProsemirrorPlugin } from '@/extensions/SideMenu/SideMenuPlugin'
import { SuggestionMenuProseMirrorPlugin } from '@/extensions/SuggestionMenu/SuggestionPlugin'
import { TableHandlesProsemirrorPlugin } from '@/extensions/TableHandles/TableHandlesPlugin'
import { UniqueID } from '@/extensions/UniqueID/UniqueID'
import { Dictionary } from '@/i18n/dictionary'
import { en } from '@/i18n/locales/index'
import {
	BlockIdentifier,
	BlockSchema,
	BlockSpecs,
	EtcDocDOMAttributes,
	InlineContentSchema,
	InlineContentSpecs,
	PartialInlineContent,
	StyleSchema,
	StyleSpecs,
	Styles,
} from '@/schema/index'
import { mergeCSSClasses } from '@/util/browser'
import { UnreachableCaseError } from '@/util/typescript'
import { getEtcDocExtensions } from './EtcDocExtensions'
import { EtcDocSchema } from './EtcDocSchema'
import { EtcDocTipTapEditor, EtcDocTipTapEditorOptions } from './EtcDocTipTapEditor'
import { TextCursorPosition } from './cursorPositionTypes'
import { Selection } from './selectionTypes'
import { transformPasted } from './transformPasted'

export type EtcDocEditorOptions<
	BSchema extends BlockSchema,
	ISchema extends InlineContentSchema,
	SSchema extends StyleSchema,
> = {
	/**
	 * Whether changes to blocks (like indentation, creating lists, changing headings) should be animated or not. Defaults to `true`.
	 *
	 * @default true
	 */
	animations?: boolean

	disableExtensions: string[]
	/**
	 * A dictionary object containing translations for the editor.
	 */
	dictionary?: Dictionary

	/**
	 * @deprecated, provide placeholders via dictionary instead
	 */
	placeholders: Record<string | 'default', string>

	/**
	 * An object containing attributes that should be added to HTML elements of the editor.
	 *
	 * @example { editor: { class: "my-editor-class" } }
	 */
	domAttributes: Partial<EtcDocDOMAttributes>

	/**
	 * The content that should be in the editor when it's created, represented as an array of partial block objects.
	 */
	initialContent: PartialBlock<
		NoInfer<BSchema>,
		NoInfer<ISchema>,
		NoInfer<SSchema>
	>[]
	/**
	 * Use default EtcDoc font and reset the styles of <p> <li> <h1> elements etc., that are used in EtcDoc.
	 *
	 * @default true
	 */
	defaultStyles: boolean

	schema: EtcDocSchema<BSchema, ISchema, SSchema>

	/**
	 * The `uploadFile` method is what the editor uses when files need to be uploaded (for example when selecting an image to upload).
	 * This method should set when creating the editor as this is application-specific.
	 *
	 * `undefined` means the application doesn't support file uploads.
	 *
	 * @param file The file that should be uploaded.
	 * @returns The URL of the uploaded file OR an object containing props that should be set on the file block (such as an id)
	 */
	uploadFile: (file: File, blockId?: string) => Promise<string | Record<string, any>>

	/**
	 * Resolve a URL of a file block to one that can be displayed or downloaded. This can be used for creating authenticated URL or
	 * implementing custom protocols / schemes
	 * @returns The URL that's
	 */
	resolveFileUrl: (url: string) => Promise<string>

	/**
	 * When enabled, allows for collaboration between multiple users.
	 */
	collaboration: {
		/**
		 * The Yjs XML fragment that's used for collaboration.
		 */
		fragment: Y.XmlFragment
		/**
		 * The user info for the current user that's shown to other collaborators.
		 */
		user: {
			name: string
			color: string
		}
		/**
		 * A Yjs provider (used for awareness / cursor information)
		 */
		provider: any
		/**
		 * Optional function to customize how cursors of users are rendered
		 */
		renderCursor?: (user: any) => HTMLElement
	}

	// tiptap options, undocumented
	_tiptapOptions: Partial<EditorOptions>

	trailingBlock?: boolean

	/**
	 * Boolean indicating whether the editor is in headless mode.
	 * Headless mode means we can use features like importing / exporting blocks,
	 * but there's no underlying editor (UI) instantiated.
	 *
	 * You probably don't need to set this manually, but use the `server-util` package instead that uses this option internally
	 */
	_headless: boolean

	/**
	 * A flag indicating whether to set an HTML ID for every block
	 *
	 * When set to `true`, on each block an id attribute will be set with the block id
	 * Otherwise, the HTML ID attribute will not be set.
	 *
	 * (note that the id is always set on the `data-id` attribute)
	 */
	setIdAttribute?: boolean
}

const EtcDocTipTapOptions = {
	enableInputRules: true,
	enablePasteRules: true,
	enableCoreExtensions: false,
}

export class EtcDocEditor<
	BSchema extends BlockSchema = DefaultBlockSchema,
	ISchema extends InlineContentSchema = DefaultInlineContentSchema,
	SSchema extends StyleSchema = DefaultStyleSchema,
> {
	private readonly _pmSchema: Schema

	/**
	 * Boolean indicating whether the editor is in headless mode.
	 * Headless mode means we can use features like importing / exporting blocks,
	 * but there's no underlying editor (UI) instantiated.
	 *
	 * You probably don't need to set this manually, but use the `server-util` package instead that uses this option internally
	 */
	public readonly headless: boolean = false

	/**
	 * The underlying Tiptap editor instance.
	 * Note: This is `undefined` in headless mode. Use methods with proper headless checks
	 * instead of directly accessing this property whenever possible.
	 */
	public readonly _tiptapEditor: EtcDocTipTapEditor & {
		contentComponent: any
	} = undefined as any

	/**
	 * Used by React to store a reference to an `ElementRenderer` helper utility to make sure we can render React elements
	 * in the correct context (used by `ReactRenderUtil`)
	 */
	public elementRenderer: ((node: any, container: HTMLElement) => void) | null = null

	/**
	 * Cache of all blocks. This makes sure we don't have to "recompute" blocks if underlying Prosemirror Nodes haven't changed.
	 * This is especially useful when we want to keep track of the same block across multiple operations,
	 * with this cache, blocks stay the same object reference (referential equality with ===).
	 */
	public blockCache = new WeakMap<Node, Block<any, any, any>>()

	/**
	 * The dictionary contains translations for the editor.
	 */
	public readonly dictionary: Dictionary

	/**
	 * The schema of the editor. The schema defines which Blocks, InlineContent, and Styles are available in the editor.
	 */
	public readonly schema: EtcDocSchema<BSchema, ISchema, SSchema>

	public readonly blockImplementations: BlockSpecs
	public readonly inlineContentImplementations: InlineContentSpecs
	public readonly styleImplementations: StyleSpecs

	public readonly formattingToolbar: FormattingToolbarProsemirrorPlugin
	public readonly linkToolbar: LinkToolbarProsemirrorPlugin<
		BSchema,
		ISchema,
		SSchema
	>
	public readonly sideMenu: SideMenuProsemirrorPlugin<BSchema, ISchema, SSchema>
	public readonly suggestionMenus: SuggestionMenuProseMirrorPlugin<
		BSchema,
		ISchema,
		SSchema
	>
	public readonly filePanel?: FilePanelProsemirrorPlugin<ISchema, SSchema>
	public readonly tableHandles?: TableHandlesProsemirrorPlugin<ISchema, SSchema>

	/**
	 * The `uploadFile` method is what the editor uses when files need to be uploaded (for example when selecting an image to upload).
	 * This method should set when creating the editor as this is application-specific.
	 *
	 * `undefined` means the application doesn't support file uploads.
	 *
	 * @param file The file that should be uploaded.
	 * @returns The URL of the uploaded file OR an object containing props that should be set on the file block (such as an id)
	 */
	public readonly uploadFile:
		| ((file: File, blockId?: string) => Promise<string | Record<string, any>>)
		| undefined

	private onUploadStartCallbacks: ((blockId?: string) => void)[] = []
	private onUploadEndCallbacks: ((blockId?: string) => void)[] = []

	public readonly resolveFileUrl: (url: string) => Promise<string>

	public get pmSchema() {
		return this._pmSchema
	}

	public static create<
		BSchema extends BlockSchema = DefaultBlockSchema,
		ISchema extends InlineContentSchema = DefaultInlineContentSchema,
		SSchema extends StyleSchema = DefaultStyleSchema,
	>(options: Partial<EtcDocEditorOptions<BSchema, ISchema, SSchema>> = {}) {
		return new EtcDocEditor<BSchema, ISchema, SSchema>(options)
	}

	protected constructor(
		protected readonly options: Partial<EtcDocEditorOptions<any, any, any>>,
	) {
		const anyOpts = options as any
		if (anyOpts.onEditorContentChange) {
			throw new Error(
				'onEditorContentChange initialization option is deprecated, use <EtcDocView onChange={...} />, the useEditorChange(...) hook, or editor.onChange(...)',
			)
		}

		if (anyOpts.onTextCursorPositionChange) {
			throw new Error(
				'onTextCursorPositionChange initialization option is deprecated, use <EtcDocView onSelectionChange={...} />, the useEditorSelectionChange(...) hook, or editor.onSelectionChange(...)',
			)
		}

		if (anyOpts.onEditorReady) {
			throw new Error(
				'onEditorReady is deprecated. Editor is immediately ready for use after creation.',
			)
		}

		if (anyOpts.editable) {
			throw new Error(
				'editable initialization option is deprecated, use <EtcDocView editable={true/false} />, or alternatively editor.isEditable = true/false',
			)
		}

		this.dictionary = options.dictionary || en

		// apply defaults
		const newOptions = {
			defaultStyles: true,
			schema: options.schema || EtcDocSchema.create(),
			_headless: false,
			...options,
			placeholders: {
				...this.dictionary.placeholders,
				...options.placeholders,
			},
		}

		// @ts-expect-error - we're casting to the correct type here
		this.schema = newOptions.schema
		this.blockImplementations = newOptions.schema.blockSpecs
		this.inlineContentImplementations = newOptions.schema.inlineContentSpecs
		this.styleImplementations = newOptions.schema.styleSpecs

		this.formattingToolbar = new FormattingToolbarProsemirrorPlugin(this)
		this.linkToolbar = new LinkToolbarProsemirrorPlugin(this)
		this.sideMenu = new SideMenuProsemirrorPlugin(this)
		this.suggestionMenus = new SuggestionMenuProseMirrorPlugin(this)
		this.filePanel = new FilePanelProsemirrorPlugin(this as any)

		if (checkDefaultBlockTypeInSchema('table', this)) {
			this.tableHandles = new TableHandlesProsemirrorPlugin(this as any)
		}

		const extensions = getEtcDocExtensions({
			editor: this,
			domAttributes: newOptions.domAttributes || {},
			blockSpecs: this.schema.blockSpecs,
			styleSpecs: this.schema.styleSpecs,
			inlineContentSpecs: this.schema.inlineContentSpecs,
			collaboration: newOptions.collaboration,
			trailingBlock: newOptions.trailingBlock,
			disableExtensions: newOptions.disableExtensions,
			setIdAttribute: newOptions.setIdAttribute,
		})

		const etcDocUIExtension = Extension.create({
			name: 'EtcDocUIExtension',

			addProseMirrorPlugins: () => {
				return [
					this.formattingToolbar.plugin,
					this.linkToolbar.plugin,
					this.sideMenu.plugin,
					this.suggestionMenus.plugin,
					...(this.filePanel ? [this.filePanel.plugin] : []),
					...(this.tableHandles ? [this.tableHandles.plugin] : []),
					PlaceholderPlugin(this, newOptions.placeholders),
					NodeSelectionKeyboardPlugin(),
					...((this.options.animations ?? true) ? [PreviousBlockTypePlugin()] : []),
				]
			},
		})
		extensions.push(etcDocUIExtension)

		if (newOptions.uploadFile) {
			const uploadFile = newOptions.uploadFile
			this.uploadFile = async (file, block) => {
				for (const callback of this.onUploadStartCallbacks) {
					callback.apply(this, [block])
				}
				try {
					return await uploadFile(file, block)
				} finally {
					for (const callback of this.onUploadEndCallbacks) {
						callback.apply(this, [block])
					}
				}
			}
		}

		this.resolveFileUrl = newOptions.resolveFileUrl || (async (url) => url)
		this.headless = newOptions._headless

		if (newOptions.collaboration && newOptions.initialContent) {
			console.warn(
				'When using Collaboration, initialContent might cause conflicts, because changes should come from the collaboration provider',
			)
		}

		const initialContent =
			newOptions.initialContent ||
			(options.collaboration
				? [
						{
							type: 'paragraph',
							id: 'initialBlockId',
						},
					]
				: [
						{
							type: 'paragraph',
							id: UniqueID.options.generateID(),
						},
					])

		if (!Array.isArray(initialContent) || initialContent.length === 0) {
			throw new Error(
				`initialContent must be a non-empty array of blocks, received: ${initialContent}`,
			)
		}

		const tiptapOptions: EtcDocTipTapEditorOptions = {
			...EtcDocTipTapOptions,
			...newOptions._tiptapOptions,
			content: initialContent,
			extensions: [...(newOptions._tiptapOptions?.extensions || []), ...extensions],
			editorProps: {
				...newOptions._tiptapOptions?.editorProps,
				attributes: {
					// As of TipTap v2.5.0 the tabIndex is removed when the editor is not
					// editable, so you can't focus it. We want to revert this as we have
					// UI behavior that relies on it.
					tabIndex: '0',
					...newOptions._tiptapOptions?.editorProps?.attributes,
					...newOptions.domAttributes?.editor,
					class: mergeCSSClasses(
						'editor',
						newOptions.defaultStyles ? 'default-styles' : '',
						newOptions.domAttributes?.editor?.class || '',
					),
				},
				transformPasted,
			},
		}

		if (this.headless) {
			// In headless mode, we don't instantiate an underlying TipTap editor,
			// but we still need the schema
			this._pmSchema = getSchema(tiptapOptions.extensions!)
		} else {
			this._tiptapEditor = EtcDocTipTapEditor.create(
				tiptapOptions,
				this.schema.styleSchema,
			) as EtcDocTipTapEditor & {
				contentComponent: any
			}
			this._pmSchema = this._tiptapEditor.schema
		}
	}

	dispatch(tr: Transaction) {
		if (this.headless) {
			return
		}
		this._tiptapEditor.dispatch(tr)
	}

	/**
	 * Mount the editor to a parent DOM element. Call mount(undefined) to clean up
	 *
	 * @warning Not needed to call manually when using React, use EtcDocView to take care of mounting
	 */
	public mount = (parentElement?: HTMLElement | null) => {
		if (this.headless) {
			return
		}
		this._tiptapEditor.mount(parentElement)
	}

	public get prosemirrorView() {
		if (this.headless) {
			throw new Error('Cannot access prosemirrorView in headless mode')
		}
		return this._tiptapEditor.view
	}

	public get domElement() {
		if (this.headless) {
			throw new Error('Cannot access domElement in headless mode')
		}
		return this._tiptapEditor.view.dom as HTMLDivElement
	}

	public isFocused() {
		return this._tiptapEditor.view.hasFocus()
	}

	public focus() {
		this._tiptapEditor.view.focus()
	}

	public onUploadStart(callback: (blockId?: string) => void) {
		this.onUploadStartCallbacks.push(callback)

		return () => {
			const index = this.onUploadStartCallbacks.indexOf(callback)
			if (index > -1) {
				this.onUploadStartCallbacks.splice(index, 1)
			}
		}
	}

	public onUploadEnd(callback: (blockId?: string) => void) {
		this.onUploadEndCallbacks.push(callback)

		return () => {
			const index = this.onUploadEndCallbacks.indexOf(callback)
			if (index > -1) {
				this.onUploadEndCallbacks.splice(index, 1)
			}
		}
	}

	/**
	 * @deprecated, use `editor.document` instead
	 */
	public get topLevelBlocks(): Block<BSchema, ISchema, SSchema>[] {
		return this.document
	}

	/**
	 * Gets a snapshot of all top-level (non-nested) blocks in the editor.
	 * @returns A snapshot of all top-level (non-nested) blocks in the editor.
	 */
	public get document(): Block<BSchema, ISchema, SSchema>[] {
		const blocks: Block<BSchema, ISchema, SSchema>[] = []

		this._tiptapEditor.state.doc.firstChild!.descendants((node) => {
			blocks.push(
				nodeToBlock(
					node,
					this.schema.blockSchema,
					this.schema.inlineContentSchema,
					this.schema.styleSchema,
					this.blockCache,
				),
			)

			return false
		})

		return blocks
	}

	/**
	 * Gets a snapshot of an existing block from the editor.
	 * @param blockIdentifier The identifier of an existing block that should be retrieved.
	 * @returns The block that matches the identifier, or `undefined` if no matching block was found.
	 */
	public getBlock(
		blockIdentifier: BlockIdentifier,
	): Block<BSchema, ISchema, SSchema> | undefined {
		const id =
			typeof blockIdentifier === 'string' ? blockIdentifier : blockIdentifier.id
		let newBlock: Block<BSchema, ISchema, SSchema> | undefined = undefined

		this._tiptapEditor.state.doc.firstChild!.descendants((node) => {
			if (typeof newBlock !== 'undefined') {
				return false
			}

			if (node.type.name !== 'blockContainer' || node.attrs.id !== id) {
				return true
			}

			newBlock = nodeToBlock(
				node,
				this.schema.blockSchema,
				this.schema.inlineContentSchema,
				this.schema.styleSchema,
				this.blockCache,
			)

			return false
		})

		return newBlock
	}

	/**
	 * Traverses all blocks in the editor depth-first, and executes a callback for each.
	 * @param callback The callback to execute for each block. Returning `false` stops the traversal.
	 * @param reverse Whether the blocks should be traversed in reverse order.
	 */
	public forEachBlock(
		callback: (block: Block<BSchema, ISchema, SSchema>) => boolean,
		reverse = false,
	): void {
		const blocks = this.document.slice()

		if (reverse) {
			blocks.reverse()
		}

		function traverseBlockArray(
			blockArray: Block<BSchema, ISchema, SSchema>[],
		): boolean {
			for (const block of blockArray) {
				if (callback(block) === false) {
					return false
				}

				const children = reverse ? block.children.slice().reverse() : block.children

				if (!traverseBlockArray(children)) {
					return false
				}
			}

			return true
		}

		traverseBlockArray(blocks)
	}

	/**
	 * Executes a callback whenever the editor's contents change.
	 * @param callback The callback to execute.
	 */
	public onEditorContentChange(callback: () => void) {
		this._tiptapEditor.on('update', callback)
	}

	/**
	 * Executes a callback whenever the editor's selection changes.
	 * @param callback The callback to execute.
	 */
	public onEditorSelectionChange(callback: () => void) {
		this._tiptapEditor.on('selectionUpdate', callback)
	}

	/**
	 * Gets a snapshot of the current text cursor position.
	 * @returns A snapshot of the current text cursor position.
	 */
	public getTextCursorPosition(): TextCursorPosition<BSchema, ISchema, SSchema> {
		return getTextCursorPosition(this)
	}

	/**
	 * Sets the text cursor position to the start or end of an existing block. Throws an error if the target block could
	 * not be found.
	 * @param targetBlock The identifier of an existing block that the text cursor should be moved to.
	 * @param placement Whether the text cursor should be placed at the start or end of the block.
	 */
	public setTextCursorPosition(
		targetBlock: BlockIdentifier,
		placement: 'start' | 'end' = 'start',
	) {
		setTextCursorPosition(this, targetBlock, placement)
	}

	/**
	 * Gets a snapshot of the current selection.
	 */
	public getSelection(): Selection<BSchema, ISchema, SSchema> | undefined {
		// Either the TipTap selection is empty, or it's a node selection. In either
		// case, it only spans one block, so we return undefined.
		if (
			this._tiptapEditor.state.selection.from ===
				this._tiptapEditor.state.selection.to ||
			'node' in this._tiptapEditor.state.selection
		) {
			return undefined
		}

		// 首先找到选区中涉及到的区块及其深度
		const blockPositions: Array<{ pos: number; depth: number; node: Node }> = []

		this._tiptapEditor.state.doc.descendants((node, pos) => {
			if (node.type.spec.group !== 'blockContent') {
				return true
			}

			// 修正区块位置和大小
			// 所有区块都被 blockContent 包装器包裹
			// blockContent 包装器位置 = 内部区块位置 - 1
			// blockContent 包装器结束 = 内部区块位置 + nodeSize + 1
			// 需要在开始位置加 1，结束位置减 1
			const end = pos + node.nodeSize - 1
			const start = pos + 1

			// 检查区块是否在选区范围内
			if (
				end <= this._tiptapEditor.state.selection.from ||
				start >= this._tiptapEditor.state.selection.to
			) {
				return true
			}

			// 获取当前节点的深度
			const depth = this._tiptapEditor.state.doc.resolve(pos).depth
			blockPositions.push({ pos, depth, node })

			return true // 继续遍历以找到所有相关区块
		})

		// 如果没有找到区块，返回空数组
		if (blockPositions.length === 0) {
			return { blocks: [] }
		}

		// 找出最小深度
		const minDepth = Math.min(...blockPositions.map((item) => item.depth))

		// 只保留最小深度的区块
		const filteredBlocks = blockPositions
			.filter((item) => item.depth === minDepth)
			.map((item) =>
				nodeToBlock(
					item.node,
					this.schema.blockSchema,
					this.schema.inlineContentSchema,
					this.schema.styleSchema,
					this.blockCache,
				),
			)

		return { blocks: filteredBlocks }
	}

	/**
	 * Checks if the editor is currently editable, or if it's locked.
	 * @returns True if the editor is editable, false otherwise.
	 */
	public get isEditable(): boolean {
		if (!this._tiptapEditor) {
			if (!this.headless) {
				throw new Error('no editor, but also not headless?')
			}
			return false
		}
		return this._tiptapEditor.isEditable === undefined
			? true
			: this._tiptapEditor.isEditable
	}

	/**
	 * Makes the editor editable or locks it, depending on the argument passed.
	 * @param editable True to make the editor editable, or false to lock it.
	 */
	public set isEditable(editable: boolean) {
		if (!this._tiptapEditor) {
			if (!this.headless) {
				throw new Error('no editor, but also not headless?')
			}
			// not relevant on headless
			return
		}
		if (this._tiptapEditor.options.editable !== editable) {
			this._tiptapEditor.setEditable(editable)
		}
	}

	/**
	 * Inserts new blocks into the editor. If a block's `id` is undefined, EtcDoc generates one automatically. Throws an
	 * error if the reference block could not be found.
	 * @param blocksToInsert An array of partial blocks that should be inserted.
	 * @param referenceBlock An identifier for an existing block, at which the new blocks should be inserted.
	 * @param placement Whether the blocks should be inserted just before, just after, or nested inside the
	 * `referenceBlock`.
	 */
	public insertBlocks(
		blocksToInsert: PartialBlock<BSchema, ISchema, SSchema>[],
		referenceBlock: BlockIdentifier,
		placement: 'before' | 'after' = 'before',
	) {
		return insertBlocks(this, blocksToInsert, referenceBlock, placement)
	}

	/**
	 * Updates an existing block in the editor. Since updatedBlock is a PartialBlock object, some fields might not be
	 * defined. These undefined fields are kept as-is from the existing block. Throws an error if the block to update could
	 * not be found.
	 * @param blockToUpdate The block that should be updated.
	 * @param update A partial block which defines how the existing block should be changed.
	 */
	public updateBlock(
		blockToUpdate: BlockIdentifier,
		update: PartialBlock<BSchema, ISchema, SSchema>,
	) {
		return updateBlock(this, blockToUpdate, update)
	}

	/**
	 * Removes existing blocks from the editor. Throws an error if any of the blocks could not be found.
	 * @param blocksToRemove An array of identifiers for existing blocks that should be removed.
	 */
	public removeBlocks(blocksToRemove: BlockIdentifier[]) {
		return removeBlocks(this, blocksToRemove)
	}

	/**
	 * Replaces existing blocks in the editor with new blocks. If the blocks that should be removed are not adjacent or
	 * are at different nesting levels, `blocksToInsert` will be inserted at the position of the first block in
	 * `blocksToRemove`. Throws an error if any of the blocks to remove could not be found.
	 * @param blocksToRemove An array of blocks that should be replaced.
	 * @param blocksToInsert An array of partial blocks to replace the old ones with.
	 */
	public replaceBlocks(
		blocksToRemove: BlockIdentifier[],
		blocksToInsert: PartialBlock<BSchema, ISchema, SSchema>[],
	) {
		return replaceBlocks(this, blocksToRemove, blocksToInsert)
	}

	/**
	 * Insert a piece of content at the current cursor position.
	 *
	 * @param content can be a string, or array of partial inline content elements
	 */
	public insertInlineContent(content: PartialInlineContent<ISchema, SSchema>) {
		const nodes = inlineContentToNodes(
			content,
			this.pmSchema,
			this.schema.styleSchema,
		)

		insertContentAt(
			{
				from: this._tiptapEditor.state.selection.from,
				to: this._tiptapEditor.state.selection.to,
			},
			nodes,
			this,
		)
	}

	/**
	 * Gets the active text styles at the text cursor position or at the end of the current selection if it's active.
	 */
	public getActiveStyles() {
		const styles: Styles<SSchema> = {}
		const marks = this._tiptapEditor.state.selection.$to.marks()

		for (const mark of marks) {
			const config = this.schema.styleSchema[mark.type.name]
			if (!config) {
				if (mark.type.name !== 'link') {
					console.warn('mark not found in styleschema', mark.type.name)
				}

				continue
			}
			if (config.propSchema === 'boolean') {
				;(styles as any)[config.type] = true
			} else {
				;(styles as any)[config.type] = mark.attrs.stringValue
			}
		}

		return styles
	}

	/**
	 * Adds styles to the currently selected content.
	 * @param styles The styles to add.
	 */
	public addStyles(styles: Styles<SSchema>) {
		for (const [style, value] of Object.entries(styles)) {
			const config = this.schema.styleSchema[style]
			if (!config) {
				throw new Error(`style ${style} not found in styleSchema`)
			}
			if (config.propSchema === 'boolean') {
				this._tiptapEditor.commands.setMark(style)
			} else if (config.propSchema === 'string') {
				this._tiptapEditor.commands.setMark(style, { stringValue: value })
			} else {
				throw new UnreachableCaseError(config.propSchema)
			}
		}
	}

	/**
	 * Removes styles from the currently selected content.
	 * @param styles The styles to remove.
	 */
	public removeStyles(styles: Styles<SSchema>) {
		for (const style of Object.keys(styles)) {
			this._tiptapEditor.commands.unsetMark(style)
		}
	}

	/**
	 * Toggles styles on the currently selected content.
	 * @param styles The styles to toggle.
	 */
	public toggleStyles(styles: Styles<SSchema>) {
		for (const [style, value] of Object.entries(styles)) {
			const config = this.schema.styleSchema[style]
			if (!config) {
				throw new Error(`style ${style} not found in styleSchema`)
			}
			if (config.propSchema === 'boolean') {
				this._tiptapEditor.commands.toggleMark(style)
			} else if (config.propSchema === 'string') {
				this._tiptapEditor.commands.toggleMark(style, { stringValue: value })
			} else {
				throw new UnreachableCaseError(config.propSchema)
			}
		}
	}

	/**
	 * Gets the currently selected text.
	 */
	public getSelectedText() {
		return this._tiptapEditor.state.doc.textBetween(
			this._tiptapEditor.state.selection.from,
			this._tiptapEditor.state.selection.to,
		)
	}

	/**
	 * Gets the URL of the last link in the current selection, or `undefined` if there are no links in the selection.
	 */
	public getSelectedLinkUrl() {
		return this._tiptapEditor.getAttributes('link').href as string | undefined
	}

	/**
	 * Creates a new link to replace the selected content.
	 * @param url The link URL.
	 * @param text The text to display the link with.
	 */
	public createLink(url: string, text?: string) {
		if (url === '') {
			return
		}

		const { from, to } = this._tiptapEditor.state.selection

		if (!text) {
			text = this._tiptapEditor.state.doc.textBetween(from, to)
		}

		const mark = this.pmSchema.mark('link', { href: url })

		this.dispatch(
			this._tiptapEditor.state.tr
				.insertText(text, from, to)
				.addMark(from, from + text.length, mark),
		)
	}

	/**
	 * Checks if the block containing the text cursor can be nested.
	 */
	public canNestBlock() {
		const { blockContainer } = getBlockInfoFromSelection(this._tiptapEditor.state)

		return (
			this._tiptapEditor.state.doc.resolve(blockContainer.beforePos).nodeBefore !==
			null
		)
	}

	/**
	 * Nests the block containing the text cursor into the block above it.
	 */
	public nestBlock() {
		this._tiptapEditor.commands.sinkListItem('blockContainer')
	}

	/**
	 * Checks if the block containing the text cursor is nested.
	 */
	public canUnnestBlock() {
		const { blockContainer } = getBlockInfoFromSelection(this._tiptapEditor.state)

		return this._tiptapEditor.state.doc.resolve(blockContainer.beforePos).depth > 1
	}

	/**
	 * Lifts the block containing the text cursor out of its parent.
	 */
	public unnestBlock() {
		this._tiptapEditor.commands.liftListItem('blockContainer')
	}

	/**
	 * Moves the block containing the text cursor up. If the previous block has
	 * children, moves it to the end of its children. If there is no previous
	 * block, but the current block is nested, moves it out of & before its parent.
	 */
	public moveBlockUp() {
		moveBlockUp(this)
	}

	/**
	 * Moves the block containing the text cursor down. If the next block has
	 * children, moves it to the start of its children. If there is no next block,
	 * but the current block is nested, moves it out of & after its parent.
	 */
	public moveBlockDown() {
		moveBlockDown(this)
	}

	/**
	 * Exports blocks into a simplified HTML string. To better conform to HTML standards, children of blocks which aren't list
	 * items are un-nested in the output HTML.
	 *
	 * @param blocks An array of blocks that should be serialized into HTML.
	 * @returns The blocks, serialized as an HTML string.
	 */
	public async blocksToHTMLLossy(
		blocks: PartialBlock<BSchema, ISchema, SSchema>[] = this.document,
	): Promise<string> {
		const exporter = createExternalHTMLExporter(this.pmSchema, this)
		return exporter.exportBlocks(blocks, {})
	}

	/**
	 * Serializes blocks into an HTML string in the format that would normally be rendered by the editor.
	 *
	 * Use this method if you want to server-side render HTML (for example, a blog post that has been edited in EtcDoc)
	 * and serve it to users without loading the editor on the client (i.e.: displaying the blog post)
	 *
	 * @param blocks An array of blocks that should be serialized into HTML.
	 * @returns The blocks, serialized as an HTML string.
	 */
	public async blocksToFullHTML(
		blocks: PartialBlock<BSchema, ISchema, SSchema>[],
	): Promise<string> {
		const exporter = createInternalHTMLSerializer(this.pmSchema, this)
		return exporter.serializeBlocks(blocks, {})
	}
	/**
	 * Parses blocks from an HTML string. Tries to create `Block` objects out of any HTML block-level elements, and
	 * `InlineNode` objects from any HTML inline elements, though not all element types are recognized. If EtcDoc
	 * doesn't recognize an HTML element's tag, it will parse it as a paragraph or plain text.
	 * @param html The HTML string to parse blocks from.
	 * @returns The blocks parsed from the HTML string.
	 */
	public async tryParseHTMLToBlocks(
		html: string,
	): Promise<Block<BSchema, ISchema, SSchema>[]> {
		return HTMLToBlocks(
			html,
			this.schema.blockSchema,
			this.schema.inlineContentSchema,
			this.schema.styleSchema,
			this.pmSchema,
		)
	}

	/**
	 * Serializes blocks into a Markdown string. The output is simplified as Markdown does not support all features of
	 * EtcDoc - children of blocks which aren't list items are un-nested and certain styles are removed.
	 * @param blocks An array of blocks that should be serialized into Markdown.
	 * @returns The blocks, serialized as a Markdown string.
	 */
	public async blocksToMarkdownLossy(
		blocks: PartialBlock<BSchema, ISchema, SSchema>[] = this.document,
	): Promise<string> {
		return blocksToMarkdown(blocks, this.pmSchema, this, {})
	}

	/**
	 * Creates a list of blocks from a Markdown string. Tries to create `Block` and `InlineNode` objects based on
	 * Markdown syntax, though not all symbols are recognized. If EtcDoc doesn't recognize a symbol, it will parse it
	 * as text.
	 * @param markdown The Markdown string to parse blocks from.
	 * @returns The blocks parsed from the Markdown string.
	 */
	public async tryParseMarkdownToBlocks(
		markdown: string,
	): Promise<Block<BSchema, ISchema, SSchema>[]> {
		return markdownToBlocks(
			markdown,
			this.schema.blockSchema,
			this.schema.inlineContentSchema,
			this.schema.styleSchema,
			this.pmSchema,
		)
	}

	/**
	 * Updates the user info for the current user that's shown to other collaborators.
	 */
	public updateCollaborationUserInfo(user: { name: string; color: string }) {
		if (!this.options.collaboration) {
			throw new Error(
				'Cannot update collaboration user info when collaboration is disabled.',
			)
		}
		this._tiptapEditor.commands.updateUser(user)
	}

	/**
	 * A callback function that runs whenever the editor's content changes.
	 *
	 * @param callback The callback to execute.
	 * @returns A function to remove the callback.
	 */
	public onChange(
		callback: (editor: EtcDocEditor<BSchema, ISchema, SSchema>) => void,
	) {
		if (this.headless) {
			// Note: would be nice if this is possible in headless mode as well
			return
		}

		const cb = () => {
			callback(this)
		}

		this._tiptapEditor.on('update', cb)

		return () => {
			this._tiptapEditor.off('update', cb)
		}
	}

	/**
	 * A callback function that runs whenever the text cursor position or selection changes.
	 *
	 * @param callback The callback to execute.
	 * @returns A function to remove the callback.
	 */
	public onSelectionChange(
		callback: (editor: EtcDocEditor<BSchema, ISchema, SSchema>) => void,
	) {
		if (this.headless) {
			return
		}

		const cb = () => {
			callback(this)
		}

		this._tiptapEditor.on('selectionUpdate', cb)

		return () => {
			this._tiptapEditor.off('selectionUpdate', cb)
		}
	}

	public openSuggestionMenu(
		triggerCharacter: string,
		pluginState?: {
			deleteTriggerCharacter?: boolean
			ignoreQueryLength?: boolean
		},
	) {
		if (this.headless) {
			throw new Error('Cannot open suggestion menu in headless mode')
		}

		const tr = this.prosemirrorView.state.tr
		const transaction = pluginState?.deleteTriggerCharacter
			? tr.insertText(triggerCharacter)
			: tr

		this.prosemirrorView.focus()
		this.prosemirrorView.dispatch(
			transaction.scrollIntoView().setMeta(this.suggestionMenus.plugin, {
				triggerCharacter: triggerCharacter,
				deleteTriggerCharacter: pluginState?.deleteTriggerCharacter || false,
				ignoreQueryLength: pluginState?.ignoreQueryLength || false,
			}),
		)
	}
}
