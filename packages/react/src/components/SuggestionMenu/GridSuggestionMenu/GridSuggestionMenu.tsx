import { ReactElement, useMemo } from 'react'

import { useComponentsContext } from '@/editor/ComponentsContext'
import { useDictionary } from '@/i18n/dictionary'
import { DefaultReactGridSuggestionItem, GridSuggestionMenuProps } from './types'

export function GridSuggestionMenu<T extends DefaultReactGridSuggestionItem>(
	props: GridSuggestionMenuProps<T>,
): ReactElement {
	const Components = useComponentsContext()!
	const dict = useDictionary()

	const { items, loadingState, selectedIndex, onItemClick, columns } = props

	const loader =
		loadingState === 'loading-initial' || loadingState === 'loading' ? (
			<Components.GridSuggestionMenu.Loader
				className={'grid-suggestion-menu-loader'}
				columns={columns}
			>
				{dict.suggestion_menu.loading}
			</Components.GridSuggestionMenu.Loader>
		) : null

	const renderedItems = useMemo<ReactElement[]>(() => {
		// let currentGroup: string | undefined = undefined;
		const renderedItems = []

		for (let i = 0; i < items.length; i++) {
			const item = items[i]
			// if (item.group !== currentGroup) {
			//   currentGroup = item.group;
			//   renderedItems.push(
			//     <Components.SuggestionMenu.Label
			//       className={"suggestion-menu-label"}
			//       key={currentGroup}>
			//       {currentGroup}
			//     </Components.SuggestionMenu.Label>
			//   );
			// }

			renderedItems.push(
				<Components.GridSuggestionMenu.Item
					className={'grid-suggestion-menu-item'}
					item={item}
					id={`grid-suggestion-menu-item-${i}`}
					isSelected={i === selectedIndex}
					key={item.id}
					onClick={() => onItemClick?.(item)}
				/>,
			)
		}

		return renderedItems
	}, [Components, items, onItemClick, selectedIndex])

	return (
		<Components.GridSuggestionMenu.Root
			id="grid-suggestion-menu"
			columns={columns}
			className="grid-suggestion-menu"
		>
			{loader}
			{renderedItems}
			{renderedItems.length === 0 && props.loadingState === 'loaded' && (
				<Components.GridSuggestionMenu.EmptyItem
					className={'grid-suggestion-menu-empty-item'}
					columns={columns}
				>
					{dict.suggestion_menu.no_items_title}
				</Components.GridSuggestionMenu.EmptyItem>
			)}
		</Components.GridSuggestionMenu.Root>
	)
}
