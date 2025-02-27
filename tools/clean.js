#!/usr/bin/env node

/**
 * Cross-platform clean script for the Doc Editor project
 * Usage:
 *   - Basic: node clean.js
 *   - With target directory: node clean.js target
 *   - With multiple directories: node clean.js dist node_modules .turbo
 */

const fs = require('fs');
const path = require('path');

// Default directories to clean if none specified
const DEFAULT_DIRS = ['dist', 'node_modules', '.turbo'];

// Get directories to clean from command line arguments or use defaults
const dirsToClean = process.argv.length > 2 ? process.argv.slice(2) : DEFAULT_DIRS;

// Get the current working directory
const cwd = process.cwd();

console.log(`🧹 Cleaning in ${cwd}...`);

// Clean each directory
dirsToClean.forEach(dir => {
  const fullPath = path.join(cwd, dir);
  
  try {
    if (fs.existsSync(fullPath)) {
      console.log(`  Removing ${dir}...`);
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`  ✅ Removed ${dir}`);
    } else {
      console.log(`  ⏭️  Skipping ${dir} (not found)`);
    }
  } catch (error) {
    console.error(`  ❌ Error removing ${dir}: ${error.message}`);
  }
});

console.log('🎉 Clean completed!');
