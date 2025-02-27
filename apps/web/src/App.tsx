import { Header } from '@/components/layout/Header'
import { useTheme } from '@/components/provider/theme-provider'
import { cn } from '@/lib'
import { Editor } from '@doc-editor/editor'
import { Button } from '@doc-editor/ui'
import { useEffect, useState } from 'react'

function App() {
	const [isDarkMode, setIsDarkMode] = useState(false)
	const { setTheme } = useTheme()

	// 模拟文档数据
	const [documents] = useState([
		{ id: '1', title: '入门指南' },
		{ id: '2', title: 'API 文档' },
		{ id: '3', title: '使用教程' },
	])

	const [activeDocumentId] = useState('1')
	const [userName, setUserName] = useState<string | undefined>(undefined)

	useEffect(() => {
		setTheme(isDarkMode ? 'dark' : 'light')
	}, [isDarkMode])

	// 模拟登录/登出功能
	const handleLogin = () => {
		setUserName('测试用户')
	}

	const handleLogout = () => {
		setUserName(undefined)
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

			{/* 主内容区 - 移除了侧边栏，使主内容区占据整个宽度 */}
			<main className="h-[calc(100vh-64px)] overflow-auto p-6">
				{userName ? (
					<div className="h-full flex flex-col">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-2xl font-bold">
								{documents.find((doc) => doc.id === activeDocumentId)?.title ||
									'新文档'}
							</h2>
							<div className="flex items-center gap-2">
								<Button size="sm" variant="outline">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="mr-1"
									>
										<path d="M12 20h9"></path>
										<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
									</svg>
									编辑
								</Button>
								<Button size="sm" variant="ghost">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="mr-1"
									>
										<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
										<polyline points="15 3 21 3 21 9"></polyline>
										<line x1="10" y1="14" x2="21" y2="3"></line>
									</svg>
									分享
								</Button>
								<button
									type="button"
									onClick={() => setIsDarkMode(!isDarkMode)}
									className="p-2 rounded-md bg-background hover:bg-accent/80"
								>
									{isDarkMode ? '🌞' : '🌙'}
								</button>
							</div>
						</div>

						<div className="border rounded-lg p-4 flex-1 bg-card">
							<Editor
								documentId={activeDocumentId}
								userName={userName}
								initialContent="<h2>开始编辑您的文档</h2><p>这是一个协作式文档编辑器，您可以邀请他人一起编辑。</p>"
							/>
						</div>
					</div>
				) : (
					<div className="h-full flex flex-col items-center justify-center text-center">
						<div className="max-w-3xl mx-auto">
							<div className="mb-6">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="h-16 w-16 mx-auto text-primary"
								>
									<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
									<polyline points="14 2 14 8 20 8" />
									<path d="M9.5 12.5l1.5 1.5 3.5-3.5" />
								</svg>
							</div>
							<h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
								Doc Editor
							</h1>
							<p className="text-xl mb-8 text-muted-foreground">
								现代化的协作文档编辑平台，让团队协作更高效
							</p>

							<div className="flex justify-center mb-12">
								<Button size="lg" onClick={handleLogin} className="mr-4">
									立即开始
								</Button>
								<Button size="lg" variant="outline">
									了解更多
								</Button>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
								<div className="p-6 border rounded-lg bg-card">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="mb-4 text-primary"
									>
										<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
									</svg>
									<h3 className="text-lg font-semibold mb-2">实时协作</h3>
									<p className="text-muted-foreground">
										多人同时编辑文档，实时查看彼此的修改，提高团队工作效率。
									</p>
								</div>
								<div className="p-6 border rounded-lg bg-card">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="mb-4 text-primary"
									>
										<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
										<line x1="8" y1="21" x2="16" y2="21"></line>
										<line x1="12" y1="17" x2="12" y2="21"></line>
									</svg>
									<h3 className="text-lg font-semibold mb-2">跨平台支持</h3>
									<p className="text-muted-foreground">
										在任何设备上访问您的文档，随时随地进行编辑和查看。
									</p>
								</div>
								<div className="p-6 border rounded-lg bg-card">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="mb-4 text-primary"
									>
										<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
										<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
									</svg>
									<h3 className="text-lg font-semibold mb-2">智能提醒</h3>
									<p className="text-muted-foreground">
										接收文档更新通知，不错过任何重要的修改和评论。
									</p>
								</div>
							</div>

							<div className="border-t pt-8">
								<p className="text-sm text-muted-foreground">
									© 2023 Doc Editor. 保留所有权利。
								</p>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	)
}

export default App
