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
		<div className="p-6 bg-card rounded-lg border">
			<h2 className="text-2xl font-bold mb-6">Icon Showcase</h2>

			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
				{iconTypes.map((type) => (
					<div
						key={type}
						className="flex flex-col items-center justify-center p-4 border rounded-md hover:bg-accent/10 transition-colors"
					>
						<Icon type={type} size={32} className="mb-2" />
						<span className="text-sm text-muted-foreground">{type}</span>
					</div>
				))}
			</div>

			<h3 className="text-xl font-semibold mt-8 mb-4">Animations</h3>
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
				<div className="flex flex-col items-center justify-center p-4 border rounded-md">
					<Icon type="document" size={32} className="mb-2" animate="pulse" />
					<span className="text-sm text-muted-foreground">pulse</span>
				</div>
				<div className="flex flex-col items-center justify-center p-4 border rounded-md">
					<Icon type="settings" size={32} className="mb-2" animate="spin" />
					<span className="text-sm text-muted-foreground">spin</span>
				</div>
				<div className="flex flex-col items-center justify-center p-4 border rounded-md">
					<Icon type="notification" size={32} className="mb-2" animate="bounce" />
					<span className="text-sm text-muted-foreground">bounce</span>
				</div>
			</div>

			<h3 className="text-xl font-semibold mt-8 mb-4">Sizes</h3>
			<div className="flex items-end justify-center gap-4 p-4 border rounded-md">
				<div className="flex flex-col items-center">
					<Icon type="document" size={16} className="mb-2" />
					<span className="text-xs text-muted-foreground">16px</span>
				</div>
				<div className="flex flex-col items-center">
					<Icon type="document" size={24} className="mb-2" />
					<span className="text-xs text-muted-foreground">24px</span>
				</div>
				<div className="flex flex-col items-center">
					<Icon type="document" size={32} className="mb-2" />
					<span className="text-xs text-muted-foreground">32px</span>
				</div>
				<div className="flex flex-col items-center">
					<Icon type="document" size={48} className="mb-2" />
					<span className="text-xs text-muted-foreground">48px</span>
				</div>
				<div className="flex flex-col items-center">
					<Icon type="document" size={64} className="mb-2" />
					<span className="text-xs text-muted-foreground">64px</span>
				</div>
			</div>

			<h3 className="text-xl font-semibold mt-8 mb-4">Colors</h3>
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
				<div className="flex flex-col items-center justify-center p-4 border rounded-md">
					<Icon type="document" size={32} className="mb-2" color="primary" />
					<span className="text-sm text-muted-foreground">primary</span>
				</div>
				<div className="flex flex-col items-center justify-center p-4 border rounded-md">
					<Icon type="document" size={32} className="mb-2" color="destructive" />
					<span className="text-sm text-muted-foreground">destructive</span>
				</div>
				<div className="flex flex-col items-center justify-center p-4 border rounded-md">
					<Icon type="document" size={32} className="mb-2" color="accent" />
					<span className="text-sm text-muted-foreground">accent</span>
				</div>
				<div className="flex flex-col items-center justify-center p-4 border rounded-md">
					<Icon type="document" size={32} className="mb-2" color="muted" />
					<span className="text-sm text-muted-foreground">muted</span>
				</div>
			</div>
		</div>
	)
}

export default IconShowcase
