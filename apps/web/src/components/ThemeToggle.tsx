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
			className="rounded-md bg-background hover:bg-accent/80"
		>
			{theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
		</Button>
	)
}

export default ThemeToggle
