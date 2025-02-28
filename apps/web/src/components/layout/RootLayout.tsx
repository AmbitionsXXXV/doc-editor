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
				<Outlet context={{ isDarkMode, setIsDarkMode, userName }} />
			</SidebarInset>
		</SidebarProvider>
	)
}

export default RootLayout
