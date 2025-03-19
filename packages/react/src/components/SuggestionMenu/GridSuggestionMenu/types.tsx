import { DefaultGridSuggestionItem } from '@doc-editor/core'

import { ReactElement } from 'react'
import { SuggestionMenuProps } from '../types'

export type DefaultReactGridSuggestionItem = DefaultGridSuggestionItem & {
	icon?: ReactElement
}

export type GridSuggestionMenuProps<T> = SuggestionMenuProps<T> & {
	columns: number
}
