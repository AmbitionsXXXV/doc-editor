import { Icon } from '@/icons'
import { BackgroundLines } from '@/ui/background-lines'
import { Button } from '@/ui/button'
import { useNavigate } from 'react-router'

export function Home() {
	const navigate = useNavigate()

	const handleGetStarted = () => {
		navigate('/documents')
	}

	return (
		<BackgroundLines className="flex items-center justify-center w-full flex-col px-4">
			<div className="flex flex-col h-full">
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
					</div>
				</main>
			</div>
		</BackgroundLines>
	)
}

export default Home
