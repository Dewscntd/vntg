#!/usr/bin/env node

/**
 * Development Mode Switcher
 *
 * Easily switch between different development modes:
 * - stub: In-memory mocks/fixtures (no external services)
 * - local: Local Supabase via Docker
 * - remote: Remote Supabase dev environment
 *
 * Usage:
 *   node scripts/dev-mode-switch.js stub
 *   node scripts/dev-mode-switch.js local
 *   node scripts/dev-mode-switch.js remote
 *   node scripts/dev-mode-switch.js --current (show current mode)
 */

const fs = require('fs');
const path = require('path');

const MODES = {
  stub: {
    file: '.env.local.stub',
    name: 'Stub Mode',
    description: 'In-memory mocks/fixtures (no external services)',
    setup: [],
  },
  local: {
    file: '.env.local.db',
    name: 'Local Database Mode',
    description: 'Local Supabase via Docker',
    setup: [
      'Ensure Docker Desktop is running',
      'Run: npm run db:start',
      'Run: npm run db:seed:local (if first time)',
    ],
  },
  remote: {
    file: '.env.local.remote',
    name: 'Remote Development Mode',
    description: 'Remote Supabase dev environment',
    setup: [
      'Ensure you have valid Supabase credentials in .env.local.remote',
      'Update NEXT_PUBLIC_SUPABASE_URL and keys if needed',
    ],
  },
};

const ENV_LOCAL = path.join(process.cwd(), '.env.local');

/**
 * Get the current development mode
 */
function getCurrentMode() {
  if (!fs.existsSync(ENV_LOCAL)) {
    return null;
  }

  const content = fs.readFileSync(ENV_LOCAL, 'utf-8');

  // Check for mode indicator
  const modeMatch = content.match(/NEXT_PUBLIC_DEV_MODE=(\w+)/);
  if (modeMatch) {
    return modeMatch[1];
  }

  // Fallback: check for stub indicator
  const stubMatch = content.match(/NEXT_PUBLIC_USE_STUBS=(true|false)/);
  if (stubMatch && stubMatch[1] === 'true') {
    return 'stub';
  }

  // Check if using local Supabase
  if (content.includes('127.0.0.1:54321') || content.includes('localhost:54321')) {
    return 'local';
  }

  return 'unknown';
}

/**
 * Display current mode
 */
function displayCurrentMode() {
  const currentMode = getCurrentMode();

  if (!currentMode) {
    console.log('No .env.local file found. Run this script with a mode to set one up.');
    console.log('\nAvailable modes:');
    Object.entries(MODES).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value.description}`);
    });
    return;
  }

  const modeInfo = MODES[currentMode];
  if (modeInfo) {
    console.log(`Current mode: ${modeInfo.name}`);
    console.log(`Description: ${modeInfo.description}`);
  } else {
    console.log(`Current mode: ${currentMode}`);
  }
}

/**
 * Switch to a different mode
 */
function switchMode(mode) {
  if (!MODES[mode]) {
    console.error(`Error: Invalid mode '${mode}'`);
    console.log('\nAvailable modes:');
    Object.entries(MODES).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value.description}`);
    });
    process.exit(1);
  }

  const modeConfig = MODES[mode];
  const sourceFile = path.join(process.cwd(), modeConfig.file);

  if (!fs.existsSync(sourceFile)) {
    console.error(`Error: Template file '${modeConfig.file}' not found`);
    process.exit(1);
  }

  // Backup existing .env.local if it exists
  if (fs.existsSync(ENV_LOCAL)) {
    const currentMode = getCurrentMode();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(
      process.cwd(),
      `.env.local.backup.${currentMode || 'unknown'}.${timestamp}`
    );
    fs.copyFileSync(ENV_LOCAL, backupFile);
    console.log(`Backed up current .env.local to: ${path.basename(backupFile)}`);
  }

  // Copy the template to .env.local
  fs.copyFileSync(sourceFile, ENV_LOCAL);

  console.log(`\nSwitched to: ${modeConfig.name}`);
  console.log(`Description: ${modeConfig.description}`);

  if (modeConfig.setup.length > 0) {
    console.log('\nSetup steps:');
    modeConfig.setup.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });
  }

  console.log('\nYou can now run: npm run dev');
}

/**
 * Display usage information
 */
function displayUsage() {
  console.log('Usage: node scripts/dev-mode-switch.js [mode]');
  console.log('\nAvailable modes:');
  Object.entries(MODES).forEach(([key, value]) => {
    console.log(`  ${key.padEnd(8)} - ${value.description}`);
  });
  console.log('\nOptions:');
  console.log('  --current  - Display current mode');
  console.log('  --help     - Display this help message');
  console.log('\nExamples:');
  console.log('  npm run dev:stub     # Switch to stub mode and start dev server');
  console.log('  npm run dev:local    # Switch to local DB mode and start dev server');
  console.log('  npm run dev:remote   # Switch to remote dev mode and start dev server');
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    displayUsage();
    process.exit(0);
  }

  if (args.includes('--current')) {
    displayCurrentMode();
    process.exit(0);
  }

  const mode = args[0].toLowerCase();
  switchMode(mode);
}

main();
