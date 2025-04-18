import { Extension } from '@tiptap/core'

import { defaultProps } from '@/blocks/defaultProps'

export const TextColorExtension = Extension.create({
	name: 'blockTextColor',

	addGlobalAttributes() {
		return [
			{
				types: ['blockContainer'],
				attributes: {
					textColor: {
						default: defaultProps.textColor.default,
						parseHTML: (element) =>
							element.hasAttribute('data-text-color')
								? element.getAttribute('data-text-color')
								: defaultProps.textColor.default,
						renderHTML: (attributes) => {
							if (attributes.textColor === defaultProps.textColor.default) {
								return {}
							}
							return {
								'data-text-color': attributes.textColor,
							}
						},
					},
				},
			},
		]
	},
})
