import {
	BlockSchema,
	DefaultBlockSchema,
	DefaultInlineContentSchema,
	DefaultStyleSchema,
	InlineContentSchema,
	StyleSchema,
} from '@doc-editor/core'
import { MdDragIndicator } from 'react-icons/md'

import { useComponentsContext } from '@/editor/ComponentsContext'
import { useDictionary } from '@/i18n/dictionary'
// import { DragHandleMenu } from '../DragHandleMenu/DragHandleMenu'
import { SideMenuProps } from '../SideMenuProps'

export const DragHandleButton = <
	BSchema extends BlockSchema = DefaultBlockSchema,
	I extends InlineContentSchema = DefaultInlineContentSchema,
	S extends StyleSchema = DefaultStyleSchema,
>(
	props: Omit<SideMenuProps<BSchema, I, S>, 'addBlock'>,
) => {
	const Components = useComponentsContext()!
	const dict = useDictionary()

	// const Component = props.dragHandleMenu || DragHandleMenu

	return (
		<Components.SideMenu.Button
			label={dict.side_menu.drag_handle_label}
			draggable={true}
			onDragStart={props.blockDragStart}
			onDragEnd={props.blockDragEnd}
			className={'button'}
			icon={<MdDragIndicator size={24} data-test="dragHandle" />}
		/>
	)

	// return (
	//     <Components.Generic.Menu.Root
	//         onOpenChange={(open: boolean) => {
	//             if (open) {
	//                 props.freezeMenu()
	//             } else {
	//                 props.unfreezeMenu()
	//             }
	//         }}
	//         position={'left'}
	//     >
	//         <Components.Generic.Menu.Trigger>
	//             <Components.SideMenu.Button
	//                 label={dict.side_menu.drag_handle_label}
	//                 draggable={true}
	//                 onDragStart={props.blockDragStart}
	//                 onDragEnd={props.blockDragEnd}
	//                 className={'button'}
	//                 icon={<MdDragIndicator size={24} data-test="dragHandle" />}
	//             />
	//         </Components.Generic.Menu.Trigger>
	//         <Component block={props.block} />
	//     </Components.Generic.Menu.Root>
	// )
}
