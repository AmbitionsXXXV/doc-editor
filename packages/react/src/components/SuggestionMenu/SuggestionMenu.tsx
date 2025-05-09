import { ReactElement, useMemo } from 'react'

import { useComponentsContext } from '@/editor/ComponentsContext'
import { useDictionary } from '@/i18n/dictionary'
import { DefaultReactSuggestionItem, SuggestionMenuProps } from './types'

export function SuggestionMenu<T extends DefaultReactSuggestionItem>(
	props: SuggestionMenuProps<T>,
): ReactElement {
	const Components = useComponentsContext()!
	const dict = useDictionary()

	const { items, loadingState, selectedIndex, onItemClick } = props

	const loader =
		loadingState === 'loading-initial' || loadingState === 'loading' ? (
			<Components.SuggestionMenu.Loader className={'suggestion-menu-loader'}>
				{dict.suggestion_menu.loading}
			</Components.SuggestionMenu.Loader>
		) : null

	const renderedItems = useMemo<ReactElement[]>(() => {
		let currentGroup: string | undefined = undefined
		const renderedItems = []

		for (let i = 0; i < items.length; i++) {
			const item = items[i]
			if (item.group !== currentGroup) {
				currentGroup = item.group
				renderedItems.push(
					<Components.SuggestionMenu.Label
						className={'suggestion-menu-label'}
						key={currentGroup}
					>
						{currentGroup}
					</Components.SuggestionMenu.Label>,
				)
			}

			renderedItems.push(
				<Components.SuggestionMenu.Item
					className={'suggestion-menu-item'}
					item={item}
					id={`suggestion-menu-item-${i}`}
					isSelected={i === selectedIndex}
					key={item.title}
					onClick={() => onItemClick?.(item)}
				/>,
			)
		}

		return renderedItems
	}, [Components, items, onItemClick, selectedIndex])

	return (
		<Components.SuggestionMenu.Root id="suggestion-menu" className="suggestion-menu">
			{renderedItems}
			{renderedItems.length === 0 &&
				(props.loadingState === 'loading' || props.loadingState === 'loaded') && (
					<Components.SuggestionMenu.EmptyItem className={'suggestion-menu-item'}>
						{dict.suggestion_menu.no_items_title}
					</Components.SuggestionMenu.EmptyItem>
				)}
			{loader}
		</Components.SuggestionMenu.Root>
	)
}
