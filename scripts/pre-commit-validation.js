#!/usr/bin/env node

/**
 * Pre-commit validation script
 * 
 * This script runs before git commits to ensure:
 * 1. Stub data is valid
 * 2. API schemas are consistent
 * 3. No development-only code is committed
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running pre-commit validations...\n');

let hasErrors = false;

// 1. Validate stub data schemas
console.log('📦 Validating stub data...');
try {
  execSync('npm run validate:stubs', { stdio: 'inherit' });
  console.log('✅ Stub validation passed\n');
} catch (error) {
  console.error('❌ Stub validation failed\n');
  hasErrors = true;
}

// 2. Check for development-only code
console.log('🔍 Checking for development-only code...');
const filesToCheck = [
  'middleware.ts',
  'app/admin/page.tsx',
  'lib/auth/auth-context.tsx'
];

const devPatterns = [
  /console\.log\(['"`]🎯/,
  /console\.log\(['"`]🔧/,
  /console\.log\(['"`]🔍/,
  /console\.log\(['"`]DEBUG/i,
  /debugger;?/
];

let foundDevCode = false;

for (const file of filesToCheck) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    
    for (const pattern of devPatterns) {
      if (pattern.test(content)) {
        console.error(`❌ Found development code in ${file}: ${pattern}`);
        foundDevCode = true;
      }
    }
  }
}

if (foundDevCode) {
  console.error('❌ Remove development code before committing\n');
  hasErrors = true;
} else {
  console.log('✅ No development-only code found\n');
}

// 3. Check TypeScript compilation
console.log('🔧 Checking TypeScript compilation...');
try {
  execSync('npm run type-check', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation passed\n');
} catch (error) {
  console.error('❌ TypeScript compilation failed\n');
  hasErrors = true;
}

// 4. Run linting
console.log('🧹 Running linter...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Linting passed\n');
} catch (error) {
  console.error('❌ Linting failed\n');
  hasErrors = true;
}

// Summary
console.log('='.repeat(50));
if (hasErrors) {
  console.error('❌ Pre-commit validation FAILED');
  console.log('\n💡 Fix the issues above before committing');
  console.log('   - Run "npm run validate:stubs" to fix stub issues');
  console.log('   - Remove development console.log statements');
  console.log('   - Fix TypeScript and linting errors');
  process.exit(1);
} else {
  console.log('✅ Pre-commit validation PASSED');
  console.log('🚀 Ready to commit!');
  process.exit(0);
}