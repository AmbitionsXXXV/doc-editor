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
const rootPackageJsonPath = path.join(rootDir, 'package.json')
const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'))
const workspacePackages = rootPackageJson.workspaces || []

console.log('Updating dependencies using bun...')

if (packageName) {
	const flag = isDev ? '-d' : '' // bun uses -d for dev dependencies, default is prod
	const exactFlag = isExact ? '--exact' : ''

	console.log(`Updating ${packageName} in all packages...`)

	// Update in all packages
	workspacePackages.forEach((pkgGlob) => {
		// Basic glob handling - might need refinement for complex patterns
		const packageDir = path.join(rootDir, pkgGlob.replace('/*', '')) // Assuming simple globs like "packages/*"
		// Find actual package directories within the glob pattern
		fs.readdirSync(packageDir).forEach((subDir) => {
			const fullPackagePath = path.join(packageDir, subDir)
			const packageJsonPath = path.join(fullPackagePath, 'package.json')

			if (fs.existsSync(packageJsonPath)) {
				try {
					const command =
						`cd ${fullPackagePath} && bun add ${flag} ${exactFlag} ${packageName}`.trim()
					console.log(`Running: ${command}`)
					execSync(command, { stdio: 'inherit' })
				} catch (error) {
					console.error(`Failed to update ${packageName} in ${fullPackagePath}`)
				}
			}
		})
	})
} else {
	// Update all dependencies in all packages
	console.log('Updating all dependencies in the workspace...')

	try {
		execSync('bun update', { cwd: rootDir, stdio: 'inherit' }) // Run bun update from the root
	} catch (error) {
		console.error('Failed to update dependencies', error)
	}
}

console.log('Done!')
