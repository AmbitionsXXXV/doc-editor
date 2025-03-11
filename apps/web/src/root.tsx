import { ThemeProvider } from '@/components/provider/theme-provider'
import { SidebarProvider } from '@/ui/sidebar'
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
} from 'react-router'
import './index.css'

import Loader from '@/components/Loader'
// @ts-ignore
import type { Route } from './+types/root'

export function Layout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Doc Editor</title>
				<Meta />
				<Links />
			</head>

			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

export default function Root() {
	return (
		<ThemeProvider defaultTheme="dark">
			<SidebarProvider>
				<Outlet />
			</SidebarProvider>
		</ThemeProvider>
	)
}

export function HydrateFallback() {
	return (
		<div className="flex h-screen items-center justify-center">
			<Loader />
		</div>
	)
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = 'Oops!'
	let details = 'An unexpected error occurred.'
	let stack: string | undefined

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? '404' : 'Error'
		details =
			error.status === 404
				? 'The requested page could not be found.'
				: error.statusText || details
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message
		stack = error.stack
	}

	return (
		<main className="container mx-auto p-4 pt-16">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full overflow-x-auto p-4">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	)
}
