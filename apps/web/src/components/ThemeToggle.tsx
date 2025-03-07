import { useTheme } from '@/components/provider/theme-provider'
import { Button } from '@/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
	const { theme, setTheme } = useTheme()

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
			className="size-7 rounded-full bg-background hover:rounded-full hover:bg-accent/80"
		>
			{theme === 'dark' ? (
				<Moon className="swap-on size-5 fill-current" />
			) : (
				<Sun className="swap-off size-5 fill-current" />
			)}
		</Button>
	)
}

export default ThemeToggle
