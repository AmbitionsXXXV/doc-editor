import { Header } from '@/components'
import { IconShowcase } from '@/icons'

export function IconsDemo() {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />

			<main className="flex-1 container mx-auto py-8 px-4">
				<h1 className="text-3xl font-bold mb-6">Icon System</h1>
				<p className="text-lg text-muted-foreground mb-8">
					A showcase of all available icons and their customization options.
				</p>

				<IconShowcase />
			</main>
		</div>
	)
}

export default IconsDemo
