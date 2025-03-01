import { Header } from '@/components'
import { ThemeProvider } from '@/components/provider/theme-provider'
import { ScrollArea } from '@/ui/scroll-area'
import { SidebarInset } from '@/ui/sidebar'
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import AppSidebar from './AppSidebar'

export function RootLayout() {
	const { pathname } = useLocation()
	const [userName] = useState<string | undefined>(undefined)

	return (
		<ThemeProvider defaultTheme="dark">
			{/* 顶部导航栏 */}
			{pathname !== '/' && <AppSidebar />}

			<SidebarInset>
				<Header />

				<ScrollArea className="h-[calc(100vh-4rem)]">
					<Outlet context={{ userName }} />
				</ScrollArea>
			</SidebarInset>
		</ThemeProvider>
	)
}

export default RootLayout
