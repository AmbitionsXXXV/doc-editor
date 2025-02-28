import { useTheme } from '@/components/provider/theme-provider'
import { SidebarInset, SidebarProvider } from '@/ui/sidebar'
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import AppSidebar from './AppSidebar'

export function RootLayout() {
	const [isDarkMode, setIsDarkMode] = useState(false)
	const { theme, setTheme } = useTheme()
	const { pathname } = useLocation()
	const [userName] = useState<string | undefined>(undefined)

	// Sync theme state with theme provider
	useEffect(() => {
		setIsDarkMode(theme === 'dark')
	}, [theme])

	useEffect(() => {
		setTheme(isDarkMode ? 'dark' : 'light')
	}, [isDarkMode, setTheme])

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
