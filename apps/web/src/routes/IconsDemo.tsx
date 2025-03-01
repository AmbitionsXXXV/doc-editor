import { IconShowcase } from '@/icons'

export function IconsDemo() {
	return (
		<main className="flex-1 mx-auto py-8 px-4">
			<h1 className="text-3xl font-bold mb-6">Icon System</h1>
			<p className="text-lg text-muted-foreground mb-8">
				A showcase of all available icons and their customization options.
			</p>

			<IconShowcase />
		</main>
	)
}

export default IconsDemo
