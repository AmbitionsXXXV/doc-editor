import { IconShowcase } from '@/icons'

export function IconsDemo() {
	return (
		<main className="mx-auto flex-1 px-4 py-8">
			<h1 className="mb-6 font-bold text-3xl">Icon System</h1>
			<p className="mb-8 text-lg text-muted-foreground">
				A showcase of all available icons and their customization options.
			</p>

			<IconShowcase />
		</main>
	)
}

export default IconsDemo
