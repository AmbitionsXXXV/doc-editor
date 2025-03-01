import { Header } from '@/components'
import { Icon } from '@/icons'
import { Button } from '@/ui/button'
import { useNavigate } from 'react-router'

export function Home() {
	const navigate = useNavigate()

	const handleGetStarted = () => {
		navigate('/documents')
	}

	return (
		<div className="flex flex-col min-h-screen">
			<Header />

			<main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
				<div className="max-w-3xl mx-auto w-full text-center">
					<div className="mb-6">
						<Icon
							type="document"
							size={64}
							className="mx-auto"
							color="primary"
							animate="pulse"
						/>
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
						<div className="p-6 border rounded-lg bg-card hover:shadow-md transition-all duration-300">
							<Icon type="edit" className="mb-4" color="primary" size={28} />
							<h3 className="text-lg font-semibold mb-2">实时协作</h3>
							<p className="text-muted-foreground">
								多人同时编辑文档，实时查看彼此的修改，提高团队工作效率。
							</p>
						</div>
						<div className="p-6 border rounded-lg bg-card hover:shadow-md transition-all duration-300">
							<Icon type="device" className="mb-4" color="primary" size={28} />
							<h3 className="text-lg font-semibold mb-2">跨平台支持</h3>
							<p className="text-muted-foreground">
								在任何设备上访问您的文档，随时随地进行编辑和查看。
							</p>
						</div>
						<div className="p-6 border rounded-lg bg-card hover:shadow-md transition-all duration-300">
							<Icon type="notification" className="mb-4" color="primary" size={28} />
							<h3 className="text-lg font-semibold mb-2">智能提醒</h3>
							<p className="text-muted-foreground">
								接收实时通知和更新提醒，确保您不会错过任何重要变更。
							</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}

export default Home
