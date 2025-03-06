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
			className="bg-background hover:bg-accent/80 size-7 rounded-full hover:rounded-full"
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
