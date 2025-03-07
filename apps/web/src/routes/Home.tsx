import { Icon } from '@/icons'
import { BackgroundLines } from '@/ui/background-lines'
import { Button } from '@/ui/button'
import { ColorfulText } from '@/ui/colorful-text'
import { useNavigate } from 'react-router'

export function Home() {
	const navigate = useNavigate()

	const handleGetStarted = () => {
		navigate('/documents')
	}

	return (
		<BackgroundLines className="flex w-full flex-col items-center justify-center px-4">
			<div className="flex h-full flex-col">
				<main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
					<div className="mx-auto w-full max-w-3xl text-center">
						<div className="mb-6">
							<Icon
								type="document"
								size={64}
								className="mx-auto"
								color="primary"
								animate="pulse"
							/>
						</div>
						<h1 className="mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text font-bold text-4xl text-transparent">
							<ColorfulText text="Doc Editor" />
						</h1>
						<p className="mb-8 text-muted-foreground text-xl">
							现代化的协作文档编辑平台，让团队协作更高效
						</p>

						<div className="mb-12 flex justify-center">
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
