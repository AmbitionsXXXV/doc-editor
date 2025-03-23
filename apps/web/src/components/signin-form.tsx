import { GalleryVerticalEnd } from 'lucide-react'

import { Button } from '@doc-editor/ui/button'
import { Input } from '@doc-editor/ui/input'
import { Label } from '@doc-editor/ui/label'
import { cn } from '@doc-editor/ui/lib/utils'
import { useState } from 'react'

export function SignInForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<'div'>) {
	const [isLoading, setIsLoading] = useState(false)

	const handleGoogleLogin = async () => {
		setIsLoading(true)
		try {
			// 重定向到后端的 Google 登录端点
			window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/google/login`
		} catch (error) {
			console.error('Google 登录失败:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleGithubLogin = async () => {
		setIsLoading(true)
		try {
			// 重定向到后端的 GitHub 登录端点
			window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/github/login`
		} catch (error) {
			console.error('GitHub 登录失败:', error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className={cn('flex flex-col gap-6', className)} {...props}>
			<form>
				<div className="flex flex-col gap-6">
					<div className="flex flex-col items-center gap-2">
						<a href="#" className="flex flex-col items-center gap-2 font-medium">
							<div className="flex h-8 w-8 items-center justify-center rounded-md">
								<GalleryVerticalEnd className="size-6" />
							</div>
							<span className="sr-only">Acme Inc.</span>
						</a>
						<h1 className="font-bold text-xl">欢迎使用文档编辑器</h1>
						<div className="text-center text-sm">
							还没有账号？{' '}
							<a href="#" className="underline underline-offset-4">
								注册
							</a>
						</div>
					</div>
					<div className="flex flex-col gap-6">
						<div className="grid gap-2">
							<Label htmlFor="email">邮箱</Label>
							<Input id="email" type="email" placeholder="m@example.com" required />
						</div>
						<Button type="submit" className="w-full">
							登录
						</Button>
					</div>
					<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
						<span className="relative z-10 bg-background px-2 text-muted-foreground">
							或
						</span>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<Button variant="outline" className="w-full">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path
									d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
									fill="currentColor"
								/>
							</svg>
							通过苹果登录
						</Button>
						<Button
							variant="outline"
							className="w-full"
							onClick={handleGoogleLogin}
							disabled={isLoading}
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path
									d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
									fill="currentColor"
								/>
							</svg>
							{isLoading ? '登录中...' : '通过 Google 登录'}
						</Button>
					</div>
					<Button
						variant="outline"
						className="w-full"
						onClick={handleGithubLogin}
						disabled={isLoading}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							className="mr-2 size-5"
						>
							<path
								d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
								fill="currentColor"
							/>
						</svg>
						{isLoading ? '登录中...' : '通过 GitHub 登录'}
					</Button>
				</div>
			</form>
			<div className="text-balance text-center text-muted-foreground text-xs [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary ">
				点击继续，即表示您同意我们的 <a href="#">服务条款</a> 和{' '}
				<a href="#">隐私政策</a>。
			</div>
		</div>
	)
}
