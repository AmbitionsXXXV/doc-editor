import { Button } from '@/ui/button'
import { useNavigate } from 'react-router'

export function Home() {
	const navigate = useNavigate()

	const handleGetStarted = () => {
		navigate('/documents')
	}

	return (
		<div className="h-[calc(100vh-4rem)] w-full flex flex-col items-center justify-center text-center">
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
					<Button size="lg" onClick={handleGetStarted} className="mr-4">
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
							接收实时通知和更新提醒，确保您不会错过任何重要变更。
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Home
