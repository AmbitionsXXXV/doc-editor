import ThemeToggle from '@/components/ThemeToggle'
import { Icon } from '@/icons'
import { Button } from '@/ui/button'
import { Link, useNavigate } from 'react-router'

interface HeaderProps {
	userName?: string
	onSignin?: () => void
	onLogout?: () => void
}

export const Header: React.FC<HeaderProps> = ({ userName, onSignin, onLogout }) => {
	const navigate = useNavigate()

	const handleSignIn = () => {
		if (onSignin) {
			onSignin()
		} else {
			navigate('/login')
		}
	}

	const handleLogout = () => {
		if (onLogout) {
			onLogout()
		}
	}

	return (
		<header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 h-16">
			<div className="flex items-center gap-2">
				<Link to="/" className="flex items-center gap-2">
					<Icon
						type="document"
						className="size-6"
						color="primary"
						aria-hidden="true"
					/>
					<h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
						Doc Editor
					</h1>
				</Link>
			</div>

			<div className="flex items-center gap-4">
				<nav className="hidden md:flex items-center gap-4 mr-4">
					<Link
						to="/documents"
						className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						Documents
					</Link>
					<Link
						to="/icons"
						className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						Icons
					</Link>
				</nav>

				{userName ? (
					<>
						<span className="text-sm">Welcome, {userName}</span>
						<Button variant="outline" size="sm" onClick={handleLogout}>
							Logout
						</Button>
					</>
				) : (
					<div className="flex items-center gap-2">
						<Button size="sm" onClick={handleSignIn}>
							Sign In
						</Button>
						<Link to="/signup">
							<Button variant="outline" size="sm">
								Sign Up
							</Button>
						</Link>
					</div>
				)}

				<div className="flex items-center gap-2">
					<Button
						size="sm"
						variant="ghost"
						className="rounded-full hover:rounded-full size-7"
						onClick={() =>
							window.open('https://github.com/AmbitionsXXXV/doc-editor', '_blank')
						}
					>
						<Icon type="github" className="size-4" />
					</Button>

					<ThemeToggle />
				</div>
			</div>
		</header>
	)
}

export default Header
