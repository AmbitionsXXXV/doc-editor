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
import { Form } from '@doc-editor/feature-ui/form/Form'
import { TextInput } from '@doc-editor/feature-ui/form/TextInput'
import {
	Menu,
	MenuDivider,
	MenuDropdown,
	MenuItem,
	MenuLabel,
	MenuTrigger,
} from '@doc-editor/feature-ui/menu/Menu'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@doc-editor/feature-ui/popover/popover'
import { SideMenu } from '@doc-editor/feature-ui/sideMenu/SideMenu'
import { SideMenuButton } from '@doc-editor/feature-ui/sideMenu/SideMenuButton'
import { SuggestionMenu } from '@doc-editor/feature-ui/suggestionMenu/SuggestionMenu'
import { GridSuggestionMenu } from '@doc-editor/feature-ui/suggestionMenu/gridSuggestionMenu/GridSuggestionMenu'
import { ExtendButton } from '@doc-editor/feature-ui/tableHandle/ExtendButton'
import { TableHandle } from '@doc-editor/feature-ui/tableHandle/TableHandle'
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
	SideMenu: {
		Root: SideMenu,
		Button: SideMenuButton,
	},
	SuggestionMenu,
	Generic: {
		Form: {
			Root: Form,
			TextInput: TextInput,
		},
		Menu: {
			Root: Menu,
			Trigger: MenuTrigger,
			Dropdown: MenuDropdown,
			Divider: MenuDivider,
			Label: MenuLabel,
			Item: MenuItem,
		},
		Popover: {
			Root: Popover,
			Content: PopoverContent,
			Trigger: PopoverTrigger,
		},
	},
	GridSuggestionMenu,
	TableHandle: {
		Root: TableHandle,
		ExtendButton: ExtendButton,
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
