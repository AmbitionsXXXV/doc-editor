import { Icon, type IconType } from './Icon'

const iconTypes: IconType[] = [
	'document',
	'edit',
	'device',
	'notification',
	'folder',
	'share',
	'trash',
	'settings',
	'user',
	'search',
	'plus',
	'check',
	'x',
]

export const IconShowcase = () => {
	return (
		<div className="rounded-lg border bg-card p-6">
			<h2 className="mb-6 font-bold text-2xl">Icon Showcase</h2>

			<div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
				{iconTypes.map((type) => (
					<div
						key={type}
						className="flex flex-col items-center justify-center rounded-md border p-4 transition-colors hover:bg-accent/10"
					>
						<Icon type={type} size={32} className="mb-2" />
						<span className="text-muted-foreground text-sm">{type}</span>
					</div>
				))}
			</div>

			<h3 className="mt-8 mb-4 font-semibold text-xl">Animations</h3>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
				<div className="flex flex-col items-center justify-center rounded-md border p-4">
					<Icon type="document" size={32} className="mb-2" animate="pulse" />
					<span className="text-muted-foreground text-sm">pulse</span>
				</div>
				<div className="flex flex-col items-center justify-center rounded-md border p-4">
					<Icon type="settings" size={32} className="mb-2" animate="spin" />
					<span className="text-muted-foreground text-sm">spin</span>
				</div>
				<div className="flex flex-col items-center justify-center rounded-md border p-4">
					<Icon type="notification" size={32} className="mb-2" animate="bounce" />
					<span className="text-muted-foreground text-sm">bounce</span>
				</div>
			</div>

			<h3 className="mt-8 mb-4 font-semibold text-xl">Sizes</h3>
			<div className="flex items-end justify-center gap-4 rounded-md border p-4">
				<div className="flex flex-col items-center">
					<Icon type="document" size={16} className="mb-2" />
					<span className="text-muted-foreground text-xs">16px</span>
				</div>
				<div className="flex flex-col items-center">
					<Icon type="document" size={24} className="mb-2" />
					<span className="text-muted-foreground text-xs">24px</span>
				</div>
				<div className="flex flex-col items-center">
					<Icon type="document" size={32} className="mb-2" />
					<span className="text-muted-foreground text-xs">32px</span>
				</div>
				<div className="flex flex-col items-center">
					<Icon type="document" size={48} className="mb-2" />
					<span className="text-muted-foreground text-xs">48px</span>
				</div>
				<div className="flex flex-col items-center">
					<Icon type="document" size={64} className="mb-2" />
					<span className="text-muted-foreground text-xs">64px</span>
				</div>
			</div>

			<h3 className="mt-8 mb-4 font-semibold text-xl">Colors</h3>
			<div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
				<div className="flex flex-col items-center justify-center rounded-md border p-4">
					<Icon type="document" size={32} className="mb-2" color="primary" />
					<span className="text-muted-foreground text-sm">primary</span>
				</div>
				<div className="flex flex-col items-center justify-center rounded-md border p-4">
					<Icon type="document" size={32} className="mb-2" color="destructive" />
					<span className="text-muted-foreground text-sm">destructive</span>
				</div>
				<div className="flex flex-col items-center justify-center rounded-md border p-4">
					<Icon type="document" size={32} className="mb-2" color="accent" />
					<span className="text-muted-foreground text-sm">accent</span>
				</div>
				<div className="flex flex-col items-center justify-center rounded-md border p-4">
					<Icon type="document" size={32} className="mb-2" color="muted" />
					<span className="text-muted-foreground text-sm">muted</span>
				</div>
			</div>
		</div>
	)
}

export default IconShowcase
