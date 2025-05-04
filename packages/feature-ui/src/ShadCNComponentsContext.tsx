import { createContext, use } from 'react'

import { ExtendButton } from '@doc-editor/feature-ui/tableHandle/ExtendButton'
import { TableHandle } from '@doc-editor/feature-ui/tableHandle/TableHandle'
import { Badge as ShadCNBadge } from '@doc-editor/ui/badge'
import { Button as ShadCNButton } from '@doc-editor/ui/button'
import {
	DropdownMenu as ShadCNDropdownMenu,
	DropdownMenuCheckboxItem as ShadCNDropdownMenuCheckboxItem,
	DropdownMenuContent as ShadCNDropdownMenuContent,
	DropdownMenuItem as ShadCNDropdownMenuItem,
	DropdownMenuLabel as ShadCNDropdownMenuLabel,
	DropdownMenuSeparator as ShadCNDropdownMenuSeparator,
	DropdownMenuSub as ShadCNDropdownMenuSub,
	DropdownMenuSubContent as ShadCNDropdownMenuSubContent,
	DropdownMenuSubTrigger as ShadCNDropdownMenuSubTrigger,
	DropdownMenuTrigger as ShadCNDropdownMenuTrigger,
} from '@doc-editor/ui/dropdown-menu'
import { Form as ShadCNForm } from '@doc-editor/ui/form'
import { Input as ShadCNInput } from '@doc-editor/ui/input'
import { Label as ShadCNLabel } from '@doc-editor/ui/label'
import {
	Popover as ShadCNPopover,
	PopoverContent as ShadCNPopoverContent,
	PopoverTrigger as ShadCNPopoverTrigger,
} from '@doc-editor/ui/popover'
import {
	Select as ShadCNSelect,
	SelectContent as ShadCNSelectContent,
	SelectItem as ShadCNSelectItem,
	SelectTrigger as ShadCNSelectTrigger,
	SelectValue as ShadCNSelectValue,
} from '@doc-editor/ui/select'
import { Toggle as ShadCNToggle } from '@doc-editor/ui/toggle'
import {
	Tooltip as ShadCNTooltip,
	TooltipContent as ShadCNTooltipContent,
	TooltipProvider as ShadCNTooltipProvider,
	TooltipTrigger as ShadCNTooltipTrigger,
} from '@doc-editor/ui/tooltip'

export const ShadCNDefaultComponents = {
	Badge: {
		Badge: ShadCNBadge,
	},
	Button: { Button: ShadCNButton },
	DropdownMenu: {
		DropdownMenu: ShadCNDropdownMenu,
		DropdownMenuCheckboxItem: ShadCNDropdownMenuCheckboxItem,
		DropdownMenuContent: ShadCNDropdownMenuContent,
		DropdownMenuItem: ShadCNDropdownMenuItem,
		DropdownMenuLabel: ShadCNDropdownMenuLabel,
		DropdownMenuSeparator: ShadCNDropdownMenuSeparator,
		DropdownMenuSub: ShadCNDropdownMenuSub,
		DropdownMenuSubContent: ShadCNDropdownMenuSubContent,
		DropdownMenuSubTrigger: ShadCNDropdownMenuSubTrigger,
		DropdownMenuTrigger: ShadCNDropdownMenuTrigger,
	},
	Form: {
		Form: ShadCNForm,
	},
	Input: {
		Input: ShadCNInput,
	},
	Label: {
		Label: ShadCNLabel,
	},
	Popover: {
		Popover: ShadCNPopover,
		PopoverContent: ShadCNPopoverContent,
		PopoverTrigger: ShadCNPopoverTrigger,
	},
	Select: {
		Select: ShadCNSelect,
		SelectContent: ShadCNSelectContent,
		SelectItem: ShadCNSelectItem,
		SelectTrigger: ShadCNSelectTrigger,
		SelectValue: ShadCNSelectValue,
	},
	TableHandle: {
		Root: TableHandle,
		ExtendButton: ExtendButton,
	},
	Toggle: {
		Toggle: ShadCNToggle,
	},
	Tooltip: {
		Tooltip: ShadCNTooltip,
		TooltipContent: ShadCNTooltipContent,
		TooltipProvider: ShadCNTooltipProvider,
		TooltipTrigger: ShadCNTooltipTrigger,
	},
}

export type ShadCNComponents = typeof ShadCNDefaultComponents

export const ShadCNComponentsContext = createContext<ShadCNComponents | undefined>(
	undefined,
)

export function useShadCNComponentsContext() {
	return use(ShadCNComponentsContext)
}
