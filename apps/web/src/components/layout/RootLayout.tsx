import { Header } from '@/components'
import { ScrollArea } from '@/ui/scroll-area'
import { SidebarInset, SidebarProvider } from '@/ui/sidebar'
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import AppSidebar from './AppSidebar'

export function RootLayout() {
	const [isDarkMode, setIsDarkMode] = useState(false)
	const { pathname } = useLocation()
	const [userName] = useState<string | undefined>(undefined)

	return (
		<SidebarProvider>
			{/* 顶部导航栏 */}
			{pathname !== '/' && <AppSidebar />}

			<SidebarInset>
				<Header />

				<ScrollArea className="h-[calc(100vh-4rem)]">
					<Outlet context={{ isDarkMode, setIsDarkMode, userName }} />
				</ScrollArea>
			</SidebarInset>
		</SidebarProvider>
	)
}

export default RootLayout
