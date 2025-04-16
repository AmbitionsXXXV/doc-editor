import { createContext, use } from 'react'

import { ExtendButton } from '@doc-editor/feature-ui/tableHandle/ExtendButton'
import { TableHandle } from '@doc-editor/feature-ui/tableHandle/TableHandle'
import { Badge as ShadCNBadge } from '@doc-editor/ui/badge'
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
	Badge: {
		Badge: ShadCNBadge,
	},
	Button: { Button: ShadCNButton },
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
