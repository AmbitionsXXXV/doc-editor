import { Header } from '@/components/layout/Header'
import { useTheme } from '@/components/provider/theme-provider'
import { cn } from '@/lib'
import { SidebarProvider } from '@/ui/sidebar'
import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router'

export function RootLayout() {
	const [isDarkMode, setIsDarkMode] = useState(false)
	const { theme, setTheme } = useTheme()
	const navigate = useNavigate()
	const [userName, setUserName] = useState<string | undefined>(undefined)

	// Sync theme state with theme provider
	useEffect(() => {
		setIsDarkMode(theme === 'dark')
	}, [theme])

	useEffect(() => {
		setTheme(isDarkMode ? 'dark' : 'light')
	}, [isDarkMode, setTheme])

	// 模拟登录/登出功能
	const handleLogin = () => {
		setUserName('测试用户')
		navigate('/documents')
	}

	const handleLogout = () => {
		setUserName(undefined)
		navigate('/')
	}

	return (
		<div
			className={cn(
				'min-h-screen transition-colors bg-background text-foreground',
				isDarkMode ? 'dark' : '',
			)}
		>
			{/* 顶部导航栏 */}
			<Header userName={userName} onLogin={handleLogin} onLogout={handleLogout} />

			{/* 主内容区 - 通过 Outlet 渲染子路由 */}
			<SidebarProvider>
				<Outlet context={{ isDarkMode, setIsDarkMode, userName }} />
			</SidebarProvider>
		</div>
	)
}

export default RootLayout
