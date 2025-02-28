import { Button } from '@/ui/button'
import { FileText } from 'lucide-react'
import type React from 'react'
import { Link } from 'react-router'

interface HeaderProps {
	userName?: string
	onLogin?: () => void
	onLogout?: () => void
}

export const Header: React.FC<HeaderProps> = ({ userName, onLogin, onLogout }) => {
	return (
		<header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
			<div className="flex items-center gap-2">
				<Link to="/" className="flex items-center gap-2">
					<FileText className="size-6 text-primary" aria-hidden="true" />
					<h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
						Doc Editor
					</h1>
				</Link>
			</div>
			<div className="flex items-center gap-4">
				{userName ? (
					<>
						<span className="text-sm">Welcome, {userName}</span>
						<Button variant="outline" size="sm" onClick={onLogout}>
							Logout
						</Button>
					</>
				) : (
					<Button size="sm" onClick={onLogin}>
						Login
					</Button>
				)}
			</div>
		</header>
	)
}

export default Header
