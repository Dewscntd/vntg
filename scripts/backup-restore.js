#!/usr/bin/env node

/**
 * Backup and Restore Script for VNTG E-commerce Platform
 * 
 * This script handles database backups and restoration for disaster recovery
 * Usage: 
 *   node scripts/backup-restore.js backup [--tables=table1,table2]
 *   node scripts/backup-restore.js restore --file=backup.sql
 *   node scripts/backup-restore.js list-backups
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const BACKUP_DIR = path.join(__dirname, '../backups');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class BackupManager {
  constructor() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Missing required environment variables');
    }
    
    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  }

  async ensureBackupDirectory() {
    try {
      await fs.access(BACKUP_DIR);
    } catch {
      await fs.mkdir(BACKUP_DIR, { recursive: true });
      log(`Created backup directory: ${BACKUP_DIR}`, 'blue');
    }
  }

  async getTableList() {
    const { data, error } = await this.supabase.rpc('get_table_list');
    
    if (error) {
      throw new Error(`Failed to get table list: ${error.message}`);
    }
    
    return data || [];
  }

  async backupTable(tableName) {
    log(`Backing up table: ${tableName}`, 'cyan');
    
    const { data, error } = await this.supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      throw new Error(`Failed to backup table ${tableName}: ${error.message}`);
    }
    
    return {
      table: tableName,
      data: data || [],
      count: data?.length || 0,
    };
  }

  async createBackup(options = {}) {
    const { tables = null, includeSchema = true } = options;
    
    await this.ensureBackupDirectory();
    
    log('Starting database backup...', 'blue');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.json`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);
    
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      tables: {},
      metadata: {
        supabase_url: SUPABASE_URL,
        created_by: 'backup-script',
      },
    };
    
    // Get list of tables to backup
    let tablesToBackup;
    if (tables) {
      tablesToBackup = tables.split(',').map(t => t.trim());
    } else {
      const allTables = await this.getTableList();
      tablesToBackup = allTables.filter(table => 
        !table.startsWith('auth.') && 
        !table.startsWith('storage.') &&
        !table.startsWith('realtime.')
      );
    }
    
    log(`Backing up ${tablesToBackup.length} tables...`, 'blue');
    
    // Backup each table
    for (const tableName of tablesToBackup) {
      try {
        const tableBackup = await this.backupTable(tableName);
        backup.tables[tableName] = tableBackup;
        log(`✓ ${tableName}: ${tableBackup.count} records`, 'green');
      } catch (error) {
        log(`✗ Failed to backup ${tableName}: ${error.message}`, 'red');
        backup.tables[tableName] = {
          table: tableName,
          error: error.message,
          data: [],
          count: 0,
        };
      }
    }
    
    // Save backup file
    await fs.writeFile(backupPath, JSON.stringify(backup, null, 2));
    
    const totalRecords = Object.values(backup.tables)
      .reduce((sum, table) => sum + (table.count || 0), 0);
    
    log(`✓ Backup completed: ${backupFileName}`, 'green');
    log(`Total records backed up: ${totalRecords}`, 'blue');
    
    return {
      filename: backupFileName,
      path: backupPath,
      totalRecords,
      tables: Object.keys(backup.tables).length,
    };
  }

  async restoreFromBackup(backupFile, options = {}) {
    const { dryRun = false, tables = null } = options;
    
    log(`${dryRun ? '[DRY RUN] ' : ''}Starting restore from: ${backupFile}`, 'blue');
    
    const backupPath = path.isAbsolute(backupFile) 
      ? backupFile 
      : path.join(BACKUP_DIR, backupFile);
    
    // Read backup file
    let backup;
    try {
      const backupContent = await fs.readFile(backupPath, 'utf8');
      backup = JSON.parse(backupContent);
    } catch (error) {
      throw new Error(`Failed to read backup file: ${error.message}`);
    }
    
    // Validate backup format
    if (!backup.tables || !backup.timestamp) {
      throw new Error('Invalid backup file format');
    }
    
    log(`Backup created: ${backup.timestamp}`, 'cyan');
    
    // Determine tables to restore
    let tablesToRestore = Object.keys(backup.tables);
    if (tables) {
      const requestedTables = tables.split(',').map(t => t.trim());
      tablesToRestore = tablesToRestore.filter(t => requestedTables.includes(t));
    }
    
    log(`Restoring ${tablesToRestore.length} tables...`, 'blue');
    
    for (const tableName of tablesToRestore) {
      const tableBackup = backup.tables[tableName];
      
      if (tableBackup.error) {
        log(`⚠ Skipping ${tableName}: backup had errors`, 'yellow');
        continue;
      }
      
      if (dryRun) {
        log(`[DRY RUN] Would restore ${tableBackup.count} records to ${tableName}`, 'cyan');
        continue;
      }
      
      try {
        // Clear existing data (be careful!)
        const { error: deleteError } = await this.supabase
          .from(tableName)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        
        if (deleteError) {
          log(`Warning: Could not clear ${tableName}: ${deleteError.message}`, 'yellow');
        }
        
        // Insert backup data in batches
        const batchSize = 100;
        const data = tableBackup.data;
        
        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);
          
          const { error: insertError } = await this.supabase
            .from(tableName)
            .insert(batch);
          
          if (insertError) {
            throw new Error(`Failed to insert batch: ${insertError.message}`);
          }
        }
        
        log(`✓ ${tableName}: ${data.length} records restored`, 'green');
      } catch (error) {
        log(`✗ Failed to restore ${tableName}: ${error.message}`, 'red');
      }
    }
    
    if (!dryRun) {
      log('✓ Restore completed', 'green');
    }
  }

  async listBackups() {
    await this.ensureBackupDirectory();
    
    try {
      const files = await fs.readdir(BACKUP_DIR);
      const backupFiles = files.filter(file => file.startsWith('backup-') && file.endsWith('.json'));
      
      if (backupFiles.length === 0) {
        log('No backup files found', 'yellow');
        return;
      }
      
      log('\nAvailable Backups:', 'blue');
      log('==================', 'blue');
      
      for (const file of backupFiles.sort().reverse()) {
        try {
          const filePath = path.join(BACKUP_DIR, file);
          const stats = await fs.stat(filePath);
          const content = await fs.readFile(filePath, 'utf8');
          const backup = JSON.parse(content);
          
          const totalRecords = Object.values(backup.tables)
            .reduce((sum, table) => sum + (table.count || 0), 0);
          
          log(`${file}`, 'cyan');
          log(`  Created: ${backup.timestamp}`, 'reset');
          log(`  Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`, 'reset');
          log(`  Tables: ${Object.keys(backup.tables).length}`, 'reset');
          log(`  Records: ${totalRecords}`, 'reset');
          log('', 'reset');
        } catch (error) {
          log(`${file} (corrupted)`, 'red');
        }
      }
    } catch (error) {
      throw new Error(`Failed to list backups: ${error.message}`);
    }
  }

  async cleanupOldBackups(retentionDays = 30) {
    await this.ensureBackupDirectory();
    
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files.filter(file => file.startsWith('backup-') && file.endsWith('.json'));
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    let deletedCount = 0;
    
    for (const file of backupFiles) {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime < cutoffDate) {
        await fs.unlink(filePath);
        log(`Deleted old backup: ${file}`, 'yellow');
        deletedCount++;
      }
    }
    
    log(`Cleaned up ${deletedCount} old backup(s)`, 'green');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const manager = new BackupManager();
  
  try {
    switch (command) {
      case 'backup': {
        const tablesArg = args.find(arg => arg.startsWith('--tables='));
        const tables = tablesArg ? tablesArg.split('=')[1] : null;
        
        await manager.createBackup({ tables });
        break;
      }
      
      case 'restore': {
        const fileArg = args.find(arg => arg.startsWith('--file='));
        const tablesArg = args.find(arg => arg.startsWith('--tables='));
        const dryRun = args.includes('--dry-run');
        
        if (!fileArg) {
          throw new Error('--file parameter is required for restore');
        }
        
        const file = fileArg.split('=')[1];
        const tables = tablesArg ? tablesArg.split('=')[1] : null;
        
        await manager.restoreFromBackup(file, { dryRun, tables });
        break;
      }
      
      case 'list-backups':
        await manager.listBackups();
        break;
      
      case 'cleanup': {
        const daysArg = args.find(arg => arg.startsWith('--days='));
        const days = daysArg ? parseInt(daysArg.split('=')[1]) : 30;
        
        await manager.cleanupOldBackups(days);
        break;
      }
      
      default:
        log('Usage:', 'blue');
        log('  backup [--tables=table1,table2]', 'cyan');
        log('  restore --file=backup.json [--tables=table1,table2] [--dry-run]', 'cyan');
        log('  list-backups', 'cyan');
        log('  cleanup [--days=30]', 'cyan');
        process.exit(1);
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

module.exports = { BackupManager };
