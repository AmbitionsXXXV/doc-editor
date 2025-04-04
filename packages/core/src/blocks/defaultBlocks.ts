import Bold from '@tiptap/extension-bold'
import Code from '@tiptap/extension-code'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import Underline from '@tiptap/extension-underline'

import { AudioBlock } from '@/blocks/AudioBlockContent/AudioBlockContent'
import { CodeBlock } from '@/blocks/CodeBlockContent/CodeBlockContent'
import { FileBlock } from '@/blocks/FileBlockContent/FileBlockContent'
import { Heading } from '@/blocks/HeadingBlockContent/HeadingBlockContent'
import { ImageBlock } from '@/blocks/ImageBlockContent/ImageBlockContent'
import { BulletListItem } from '@/blocks/ListItemBlockContent/BulletListItemBlockContent/BulletListItemBlockContent'
import { CheckListItem } from '@/blocks/ListItemBlockContent/CheckListItemBlockContent/CheckListItemBlockContent'
import { NumberedListItem } from '@/blocks/ListItemBlockContent/NumberedListItemBlockContent/NumberedListItemBlockContent'
import { Paragraph } from '@/blocks/ParagraphBlockContent/ParagraphBlockContent'
import { Table } from '@/blocks/TableBlockContent/TableBlockContent'
import { VideoBlock } from '@/blocks/VideoBlockContent/VideoBlockContent'
import { BackgroundColor } from '@/extensions/BackgroundColor/BackgroundColorMark'
import { TextColor } from '@/extensions/TextColor/TextColorMark'
import {
	BlockNoDefaults,
	BlockSchema,
	BlockSpecs,
	InlineContentSchema,
	InlineContentSpecs,
	PartialBlockNoDefaults,
	StyleSchema,
	StyleSpecs,
	createStyleSpecFromTipTapMark,
	getBlockSchemaFromSpecs,
	getInlineContentSchemaFromSpecs,
	getStyleSchemaFromSpecs,
} from '@/schema/index'

export { customizeCodeBlock } from './CodeBlockContent/CodeBlockContent'

export const defaultBlockSpecs = {
	paragraph: Paragraph,
	heading: Heading,
	codeBlock: CodeBlock,
	bulletListItem: BulletListItem,
	numberedListItem: NumberedListItem,
	checkListItem: CheckListItem,
	table: Table,
	file: FileBlock,
	image: ImageBlock,
	video: VideoBlock,
	audio: AudioBlock,
} satisfies BlockSpecs

export const defaultBlockSchema = getBlockSchemaFromSpecs(defaultBlockSpecs)

// underscore is used that in case a user overrides DefaultBlockSchema,
// they can still access the original default block schema
export type _DefaultBlockSchema = typeof defaultBlockSchema
export type DefaultBlockSchema = _DefaultBlockSchema

export const defaultStyleSpecs = {
	bold: createStyleSpecFromTipTapMark(Bold, 'boolean'),
	italic: createStyleSpecFromTipTapMark(Italic, 'boolean'),
	underline: createStyleSpecFromTipTapMark(Underline, 'boolean'),
	strike: createStyleSpecFromTipTapMark(Strike, 'boolean'),
	code: createStyleSpecFromTipTapMark(Code, 'boolean'),
	textColor: TextColor,
	backgroundColor: BackgroundColor,
} satisfies StyleSpecs

export const defaultStyleSchema = getStyleSchemaFromSpecs(defaultStyleSpecs)

// underscore is used that in case a user overrides DefaultStyleSchema,
// they can still access the original default style schema
export type _DefaultStyleSchema = typeof defaultStyleSchema
export type DefaultStyleSchema = _DefaultStyleSchema

export const defaultInlineContentSpecs = {
	text: { config: 'text', implementation: {} as any },
	link: { config: 'link', implementation: {} as any },
} satisfies InlineContentSpecs

export const defaultInlineContentSchema = getInlineContentSchemaFromSpecs(
	defaultInlineContentSpecs,
)

// underscore is used that in case a user overrides DefaultInlineContentSchema,
// they can still access the original default inline content schema
export type _DefaultInlineContentSchema = typeof defaultInlineContentSchema
export type DefaultInlineContentSchema = _DefaultInlineContentSchema

export type PartialBlock<
	BSchema extends BlockSchema = DefaultBlockSchema,
	I extends InlineContentSchema = DefaultInlineContentSchema,
	S extends StyleSchema = DefaultStyleSchema,
> = PartialBlockNoDefaults<BSchema, I, S>

export type Block<
	BSchema extends BlockSchema = DefaultBlockSchema,
	I extends InlineContentSchema = DefaultInlineContentSchema,
	S extends StyleSchema = DefaultStyleSchema,
> = BlockNoDefaults<BSchema, I, S>
