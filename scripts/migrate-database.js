#!/usr/bin/env node

/**
 * Database Migration Script for Peakees E-commerce Platform
 *
 * This script handles database migrations for production deployments
 * Usage: node scripts/migrate-database.js [--dry-run] [--rollback] [--target=version]
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class DatabaseMigrator {
  constructor() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_KEY');
    }

    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  }

  async initialize() {
    log('Initializing migration system...', 'blue');

    // Create migrations table if it doesn't exist
    const { error } = await this.supabase.rpc('create_migrations_table');

    if (error && !error.message.includes('already exists')) {
      throw new Error(`Failed to create migrations table: ${error.message}`);
    }

    log('Migration system initialized', 'green');
  }

  async getMigrationFiles() {
    try {
      const files = await fs.readdir(MIGRATIONS_DIR);
      return files
        .filter((file) => file.endsWith('.sql'))
        .sort()
        .map((file) => ({
          filename: file,
          version: file.split('_')[0],
          name: file.replace(/^\d+_/, '').replace('.sql', ''),
          path: path.join(MIGRATIONS_DIR, file),
        }));
    } catch (error) {
      if (error.code === 'ENOENT') {
        log('No migrations directory found', 'yellow');
        return [];
      }
      throw error;
    }
  }

  async getAppliedMigrations() {
    const { data, error } = await this.supabase
      .from('schema_migrations')
      .select('version, applied_at')
      .order('version');

    if (error) {
      throw new Error(`Failed to get applied migrations: ${error.message}`);
    }

    return data || [];
  }

  async getPendingMigrations() {
    const migrationFiles = await this.getMigrationFiles();
    const appliedMigrations = await this.getAppliedMigrations();
    const appliedVersions = new Set(appliedMigrations.map((m) => m.version));

    return migrationFiles.filter((file) => !appliedVersions.has(file.version));
  }

  async readMigrationFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      throw new Error(`Failed to read migration file ${filePath}: ${error.message}`);
    }
  }

  async executeMigration(migration, dryRun = false) {
    log(`${dryRun ? '[DRY RUN] ' : ''}Applying migration: ${migration.name}`, 'cyan');

    const sql = await this.readMigrationFile(migration.path);

    if (dryRun) {
      log(`SQL content:\n${sql}`, 'magenta');
      return;
    }

    try {
      // Execute the migration SQL
      const { error } = await this.supabase.rpc('execute_sql', { sql_query: sql });

      if (error) {
        throw new Error(`Migration failed: ${error.message}`);
      }

      // Record the migration as applied
      const { error: insertError } = await this.supabase.from('schema_migrations').insert({
        version: migration.version,
        name: migration.name,
        applied_at: new Date().toISOString(),
      });

      if (insertError) {
        throw new Error(`Failed to record migration: ${insertError.message}`);
      }

      log(`✓ Migration ${migration.name} applied successfully`, 'green');
    } catch (error) {
      log(`✗ Migration ${migration.name} failed: ${error.message}`, 'red');
      throw error;
    }
  }

  async rollbackMigration(version) {
    log(`Rolling back migration: ${version}`, 'yellow');

    // Check if rollback file exists
    const rollbackFile = path.join(MIGRATIONS_DIR, `${version}_rollback.sql`);

    try {
      const sql = await this.readMigrationFile(rollbackFile);

      // Execute rollback SQL
      const { error } = await this.supabase.rpc('execute_sql', { sql_query: sql });

      if (error) {
        throw new Error(`Rollback failed: ${error.message}`);
      }

      // Remove migration record
      const { error: deleteError } = await this.supabase
        .from('schema_migrations')
        .delete()
        .eq('version', version);

      if (deleteError) {
        throw new Error(`Failed to remove migration record: ${deleteError.message}`);
      }

      log(`✓ Migration ${version} rolled back successfully`, 'green');
    } catch (error) {
      if (error.code === 'ENOENT') {
        log(`No rollback file found for migration ${version}`, 'red');
      }
      throw error;
    }
  }

  async migrate(options = {}) {
    const { dryRun = false, target = null } = options;

    await this.initialize();

    const pendingMigrations = await this.getPendingMigrations();

    if (pendingMigrations.length === 0) {
      log('No pending migrations', 'green');
      return;
    }

    log(`Found ${pendingMigrations.length} pending migration(s)`, 'blue');

    let migrationsToRun = pendingMigrations;

    if (target) {
      migrationsToRun = pendingMigrations.filter((m) => m.version <= target);
    }

    for (const migration of migrationsToRun) {
      await this.executeMigration(migration, dryRun);
    }

    if (!dryRun) {
      log(`✓ All migrations completed successfully`, 'green');
    }
  }

  async rollback(version) {
    await this.initialize();

    if (!version) {
      // Get the last applied migration
      const appliedMigrations = await this.getAppliedMigrations();
      if (appliedMigrations.length === 0) {
        log('No migrations to rollback', 'yellow');
        return;
      }
      version = appliedMigrations[appliedMigrations.length - 1].version;
    }

    await this.rollbackMigration(version);
  }

  async status() {
    await this.initialize();

    const migrationFiles = await this.getMigrationFiles();
    const appliedMigrations = await this.getAppliedMigrations();
    const appliedVersions = new Set(appliedMigrations.map((m) => m.version));

    log('\nMigration Status:', 'blue');
    log('================', 'blue');

    if (migrationFiles.length === 0) {
      log('No migration files found', 'yellow');
      return;
    }

    for (const file of migrationFiles) {
      const status = appliedVersions.has(file.version) ? '✓ Applied' : '✗ Pending';
      const color = appliedVersions.has(file.version) ? 'green' : 'yellow';
      log(`${status} ${file.version} - ${file.name}`, color);
    }

    const pendingCount = migrationFiles.length - appliedMigrations.length;
    log(
      `\nTotal: ${migrationFiles.length} migrations, ${appliedMigrations.length} applied, ${pendingCount} pending`,
      'blue'
    );
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const rollback = args.includes('--rollback');
  const targetArg = args.find((arg) => arg.startsWith('--target='));
  const target = targetArg ? targetArg.split('=')[1] : null;

  const migrator = new DatabaseMigrator();

  try {
    if (rollback) {
      const version = args.find((arg) => !arg.startsWith('--'));
      await migrator.rollback(version);
    } else if (args.includes('--status')) {
      await migrator.status();
    } else {
      await migrator.migrate({ dryRun, target });
    }
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { DatabaseMigrator };
