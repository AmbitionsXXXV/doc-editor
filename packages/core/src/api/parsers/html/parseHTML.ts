import { DOMParser, Schema } from 'prosemirror-model'

import { nodeToBlock } from '@/api/nodeConversions/nodeToBlock'
import { Block } from '@/blocks/defaultBlocks'
import { BlockSchema, InlineContentSchema, StyleSchema } from '@/schema/index'
import { nestedListsToEtcDocStructure } from './util/nestedLists'

export async function HTMLToBlocks<
	BSchema extends BlockSchema,
	I extends InlineContentSchema,
	S extends StyleSchema,
>(
	html: string,
	blockSchema: BSchema,
	icSchema: I,
	styleSchema: S,
	pmSchema: Schema,
): Promise<Block<BSchema, I, S>[]> {
	const htmlNode = nestedListsToEtcDocStructure(html)
	const parser = DOMParser.fromSchema(pmSchema)

	// Other approach might be to use
	// const doc = pmSchema.nodes["doc"].createAndFill()!;
	// and context: doc.resolve(3),

	const parentNode = parser.parse(htmlNode, {
		topNode: pmSchema.nodes['blockGroup'].create(),
	})

	const blocks: Block<BSchema, I, S>[] = []

	for (let i = 0; i < parentNode.childCount; i++) {
		blocks.push(nodeToBlock(parentNode.child(i), blockSchema, icSchema, styleSchema))
	}

	return blocks
}
