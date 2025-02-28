import { FileTextIcon, PlusIcon } from 'lucide-react'
import type React from 'react'

import { Button } from '@/ui/button'
import {
	Sidebar as ShadcnSidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/ui/sidebar'

interface Document {
	id: string
	title: string
}

interface SidebarProps {
	documents: Document[]
	activeDocumentId?: string
	onDocumentSelect: (id: string) => void
	onCreateDocument: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
	documents,
	activeDocumentId,
	onDocumentSelect,
	onCreateDocument,
}) => {
	return (
		<ShadcnSidebar className="h-[calc(100vh-64px)]">
			<SidebarHeader className="px-4 py-3">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">Documents</h2>
					<Button size="sm" onClick={onCreateDocument}>
						<PlusIcon className="h-4 w-4 mr-1" />
						New
					</Button>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarMenu>
					{documents.length === 0 ? (
						<div className="px-4 py-2">
							<p className="text-sm text-gray-500 dark:text-gray-400">
								No documents yet. Create one to get started.
							</p>
						</div>
					) : (
						documents.map((doc) => (
							<SidebarMenuItem key={doc.id}>
								<SidebarMenuButton
									isActive={activeDocumentId === doc.id}
									onClick={() => onDocumentSelect(doc.id)}
								>
									<FileTextIcon className="h-4 w-4" />
									<span>{doc.title}</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))
					)}
				</SidebarMenu>
			</SidebarContent>

			<SidebarFooter className="px-4 py-3">
				{/* Footer content if needed */}
			</SidebarFooter>
		</ShadcnSidebar>
	)
}

export default Sidebar
