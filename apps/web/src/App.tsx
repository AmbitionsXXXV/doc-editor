import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useTheme } from './components/provider/theme-provider'

function App() {
	const [isDarkMode, setIsDarkMode] = useState(false)
	const { setTheme } = useTheme()

	useEffect(() => {
		setTheme(isDarkMode ? 'dark' : 'light')
	}, [isDarkMode])

	return (
		<div
			className={cn(
				'min-h-screen transition-colors bg-background',
				isDarkMode ? 'dark' : '',
			)}
		>
			<div className="container mx-auto p-4">
				<header className="py-6 mb-8 border-b">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold">文档编辑器</h1>
						<button
							type="button"
							onClick={() => setIsDarkMode(!isDarkMode)}
							className="p-2 rounded-md bg-background hover:bg-accent/80"
						>
							{isDarkMode ? '🌞 Light' : '🌙 Dark'}
						</button>
					</div>
				</header>

				<main>
					<div className="grid grid-cols-1 gap-8 md:grid-cols-[250px_1fr]">
						<aside className="h-[calc(100vh-12rem)] border rounded-lg p-4">
							<h2 className="text-lg font-medium mb-4">文档列表</h2>
							<nav className="space-y-1">
								<a
									href="#"
									className="block p-2 rounded-md bg-primary text-primary-foreground"
								>
									入门指南
								</a>
								<a href="#" className="block p-2 rounded-md hover:bg-accent">
									API 文档
								</a>
								<a href="#" className="block p-2 rounded-md hover:bg-accent">
									使用教程
								</a>
							</nav>
						</aside>

						<section className="border rounded-lg p-6">
							<h2 className="text-xl font-bold mb-4">入门指南</h2>
							<div className="prose max-w-none">
								<p>欢迎使用我们的在线文档编辑系统。点击以下区域开始编辑：</p>

								<div className="mt-6 p-4 border rounded-md min-h-[300px]">
									<div className="text-muted-foreground italic">
										点击此处开始编辑文档内容...
									</div>
								</div>
							</div>
						</section>
					</div>
				</main>
			</div>
		</div>
	)
}

export default App
