#!/usr/bin/env bun

/**
 * Cross-platform clean script for the Doc Editor project using Bun Shell
 * Usage:
 *   - Basic: bun tools/clean.js
 *   - With target directory: bun tools/clean.js target
 *   - With multiple directories: bun tools/clean.js dist node_modules .turbo
 */

import { existsSync } from 'node:fs' // Still useful for a quick synchronous check
import { join } from 'node:path'
import { cwd } from 'node:process'
import { $ } from 'bun'

// Default directories to clean if none specified
const DEFAULT_DIRS = ['dist', 'node_modules', '.turbo']

// Get directories to clean from command line arguments (excluding 'bun' and script path)
const args = Bun.argv.slice(2)
const dirsToClean = args.length > 0 ? args : DEFAULT_DIRS

// Get the current working directory
const currentWorkingDirectory = cwd()

console.log(`🧹 Cleaning in ${currentWorkingDirectory} using Bun Shell...`)

// Clean each directory asynchronously
for (const dir of dirsToClean) {
	const fullPath = join(currentWorkingDirectory, dir)

	try {
		// Use existsSync for a quick check before attempting removal
		if (existsSync(fullPath)) {
			console.log(`  Removing ${dir}...`)
			// Use Bun Shell for robust, cross-platform removal
			await $`rm -rf ${fullPath}`.quiet() // .quiet() suppresses stdout/stderr from the shell command itself
			console.log(`  ✅ Removed ${dir}`)
		} else {
			console.log(`  ⏭️  Skipping ${dir} (not found)`)
		}
	} catch (error) {
		// Bun Shell throws errors for non-zero exit codes
		console.error(`  ❌ Error removing ${dir}: ${error.message}`)
		// Optionally log stderr if needed: console.error(error.stderr.toString())
	}
}

console.log('🎉 Clean completed!')
