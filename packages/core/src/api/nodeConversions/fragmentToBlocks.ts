import { Fragment } from '@tiptap/pm/model'

import { EtcDocSchema } from '../../editor/EtcDocSchema'
import {
	BlockNoDefaults,
	BlockSchema,
	InlineContentSchema,
	StyleSchema,
} from '../../schema/index'
import { nodeToBlock } from './nodeToBlock'

/**
 * Converts all Blocks within a fragment to EtcDoc blocks.
 */
export function fragmentToBlocks<
	B extends BlockSchema,
	I extends InlineContentSchema,
	S extends StyleSchema,
>(fragment: Fragment, schema: EtcDocSchema<B, I, S>) {
	// first convert selection to etcdoc-style blocks, and then
	// pass these to the exporter
	const blocks: BlockNoDefaults<B, I, S>[] = []
	fragment.descendants((node) => {
		if (node.type.name === 'blockContainer') {
			if (node.firstChild?.type.name === 'blockGroup') {
				// selection started within a block group
				// in this case the fragment starts with:
				// <blockContainer>
				//   <blockGroup>
				//     <blockContainer ... />
				//     <blockContainer ... />
				//   </blockGroup>
				// </blockContainer>
				//
				// instead of:
				// <blockContainer>
				//   <blockContent ... />
				//   <blockGroup>
				//     <blockContainer ... />
				//     <blockContainer ... />
				//   </blockGroup>
				// </blockContainer>
				//
				// so we don't need to serialize this block, just descend into the children of the blockGroup
				return true
			}
			blocks.push(
				nodeToBlock(
					node,
					schema.blockSchema,
					schema.inlineContentSchema,
					schema.styleSchema,
				),
			)
			// don't descend into children, as they're already included in the block returned by nodeToBlock
			return false
		}
		return true
	})
	return blocks
}
