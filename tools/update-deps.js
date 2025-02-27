#!/usr/bin/env node

/**
 * This script updates dependencies across all packages in the monorepo.
 * It can be used to update a specific package or all packages.
 *
 * Usage:
 *   node tools/update-deps.js [package-name] [--dev] [--exact]
 *
 * Examples:
 *   node tools/update-deps.js react --exact
 *   node tools/update-deps.js typescript --dev
 *   node tools/update-deps.js
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Parse arguments
const args = process.argv.slice(2)
const packageName = args.find((arg) => !arg.startsWith('--'))
const isDev = args.includes('--dev')
const isExact = args.includes('--exact')

// Get all workspace packages
const rootDir = path.resolve(__dirname, '..')
const workspaceFile = path.join(rootDir, 'pnpm-workspace.yaml')
const workspaceContent = fs.readFileSync(workspaceFile, 'utf8')
const workspacePackages = workspaceContent
	.split('\n')
	.filter((line) => line.includes('- '))
	.map((line) => line.trim().replace('- ', ''))

console.log('Updating dependencies...')

if (packageName) {
	const flag = isDev ? '-D' : '-S'
	const exactFlag = isExact ? '-E' : ''

	console.log(`Updating ${packageName} in all packages...`)

	// Update in all packages
	workspacePackages.forEach((pkg) => {
		const packageDir = path.join(rootDir, pkg)
		const packageJsonPath = path.join(packageDir, 'package.json')

		if (fs.existsSync(packageJsonPath)) {
			try {
				const command = `cd ${packageDir} && pnpm add ${flag} ${exactFlag} ${packageName}`
				console.log(`Running: ${command}`)
				execSync(command, { stdio: 'inherit' })
			} catch (error) {
				console.error(`Failed to update ${packageName} in ${pkg}`)
			}
		}
	})
} else {
	// Update all dependencies in all packages
	console.log('Updating all dependencies in all packages...')

	try {
		execSync('pnpm update -r', { stdio: 'inherit' })
	} catch (error) {
		console.error('Failed to update dependencies')
	}
}

console.log('Done!')
