import { createContext, use } from 'react'

import { Button as ShadCNButton } from '@doc-editor/ui/button'
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
	Button: { Button: ShadCNButton },
	Select: {
		Select: ShadCNSelect,
		SelectContent: ShadCNSelectContent,
		SelectItem: ShadCNSelectItem,
		SelectTrigger: ShadCNSelectTrigger,
		SelectValue: ShadCNSelectValue,
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
