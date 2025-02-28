import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

// 创建路由配置
export default [
	layout('./components/layout/RootLayout.tsx', [
		index('./routes/Home.tsx'),
		route('/documents', './routes/Documents.tsx'),
	]),

	route('/login', './routes/sign/SignIn.tsx'),
	route('/signup', './routes/sign/SignUp.tsx'),
] satisfies RouteConfig
