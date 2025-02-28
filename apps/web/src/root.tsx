import { ThemeProvider } from '@/components/provider/theme-provider'
import { SidebarProvider } from '@/ui/sidebar'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import './index.css'

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
