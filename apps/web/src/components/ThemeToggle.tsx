import { Button } from '@/ui/button'
import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
	isDarkMode: boolean
	setIsDarkMode: (isDark: boolean) => void
}

export function ThemeToggle({ isDarkMode, setIsDarkMode }: ThemeToggleProps) {
	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setIsDarkMode(!isDarkMode)}
			className="rounded-md bg-background hover:bg-accent/80"
		>
			{isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
		</Button>
	)
}

export default ThemeToggle
