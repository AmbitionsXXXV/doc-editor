import { Button } from '@doc-editor/ui'
import type React from 'react'

interface HeaderProps {
	userName?: string
	onLogin?: () => void
	onLogout?: () => void
}

export const Header: React.FC<HeaderProps> = ({ userName, onLogin, onLogout }) => {
	return (
		<header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
			<div className="flex items-center gap-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="h-6 w-6 text-primary"
					aria-labelledby="docEditorTitle"
					role="img"
				>
					<title id="docEditorTitle">Doc Editor Logo</title>
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
					<polyline points="14 2 14 8 20 8" />
					<path d="M9.5 12.5l1.5 1.5 3.5-3.5" />
					<line x1="16" y1="17" x2="8" y2="17" />
					<circle cx="7" cy="20" r="1" />
				</svg>
				<h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
					Doc Editor
				</h1>
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
					<Button size="lg" onClick={onLogin}>
						Login
					</Button>
				)}
			</div>
		</header>
	)
}

export default Header
