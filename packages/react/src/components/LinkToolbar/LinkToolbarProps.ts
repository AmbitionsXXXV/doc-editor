import {
	BlockSchema,
	EtcDocEditor,
	InlineContentSchema,
	LinkToolbarState,
	StyleSchema,
	UiElementPosition,
} from '@doc-editor/core'

export type LinkToolbarProps = Omit<LinkToolbarState, keyof UiElementPosition> &
	Pick<
		EtcDocEditor<BlockSchema, InlineContentSchema, StyleSchema>['linkToolbar'],
		'deleteLink' | 'editLink' | 'startHideTimer' | 'stopHideTimer'
	>
