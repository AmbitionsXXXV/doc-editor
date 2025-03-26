import './style.css'

import {
	BlockSchema,
	InlineContentSchema,
	StyleSchema,
	mergeCSSClasses,
} from '@doc-editor/core'
import {
	ShadCNComponents,
	ShadCNComponentsContext,
	ShadCNDefaultComponents,
} from '@doc-editor/feature-ui/ShadCNComponentsContext'
import {
	Toolbar,
	ToolbarButton,
	ToolbarSelect,
} from '@doc-editor/feature-ui/toolbar/Toolbar'
import { Components, ComponentsContext, EtcDocViewRaw } from '@doc-editor/react'
import { ComponentProps, useMemo } from 'react'

// @ts-ignore
export const components: Components = {
	FormattingToolbar: {
		Root: Toolbar,
		Button: ToolbarButton,
		Select: ToolbarSelect,
	},
}

export const EtcDocView = <
	BSchema extends BlockSchema,
	ISchema extends InlineContentSchema,
	SSchema extends StyleSchema,
>(
	props: ComponentProps<typeof EtcDocViewRaw<BSchema, ISchema, SSchema>> & {
		/**
		 * (optional)Provide your own shadcn component overrides
		 */
		shadCNComponents?: Partial<ShadCNComponents>
	},
) => {
	const { className, shadCNComponents, ...rest } = props

	const componentsValue = useMemo(() => {
		return {
			...ShadCNDefaultComponents,
			...shadCNComponents,
		}
	}, [shadCNComponents])

	return (
		<ShadCNComponentsContext value={componentsValue}>
			<ComponentsContext value={components}>
				<EtcDocViewRaw
					className={mergeCSSClasses('bn-shadcn', className || '')}
					{...rest}
				/>
			</ComponentsContext>
		</ShadCNComponentsContext>
	)
}
