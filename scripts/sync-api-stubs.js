#!/usr/bin/env node

/**
 * API-Stub Sync Automation System
 * 
 * This script ensures that stub responses match real API responses by:
 * 1. Testing all API endpoints with real data
 * 2. Comparing responses with stub data
 * 3. Generating updated stub data when needed
 * 4. Validating schema consistency
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Environment setup
require('dotenv').config({ path: '.env.local' });

const REAL_API_BASE = 'http://localhost:3000/api';
const STUBS_DIR = path.join(__dirname, '../lib/stubs');
const MOCK_DATA_FILE = path.join(STUBS_DIR, 'mock-data.ts');

class APISyncValidator {
  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.useStubs = process.env.NEXT_PUBLIC_USE_STUBS === 'true';
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  async init() {
    console.log('🔄 API-Stub Sync Validator Starting...');
    console.log(`📊 Environment: USE_STUBS=${this.useStubs}`);
    
    if (this.useStubs) {
      console.log('⚠️  WARNING: Running with stubs enabled. Switch to real API for validation.');
      console.log('💡 Set NEXT_PUBLIC_USE_STUBS=false in .env.local and restart server');
      return false;
    }
    
    return true;
  }

  async validateEndpoint(endpoint, stubData, options = {}) {
    const { method = 'GET', params = {}, expectedFields = [] } = options;
    
    try {
      console.log(`🔍 Validating ${method} ${endpoint}...`);
      
      // Build URL with params
      const url = new URL(`${REAL_API_BASE}${endpoint}`);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      // Make API request
      const response = await fetch(url, { method });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const realData = await response.json();
      
      // Validate response structure
      const validation = this.compareStructures(realData, stubData, endpoint);
      
      if (validation.isValid) {
        this.results.passed.push({
          endpoint,
          message: `✅ ${endpoint} - Structure matches`
        });
      } else {
        this.results.failed.push({
          endpoint,
          message: `❌ ${endpoint} - Structure mismatch`,
          differences: validation.differences
        });
      }

      return {
        endpoint,
        realData,
        stubData,
        validation
      };

    } catch (error) {
      this.results.failed.push({
        endpoint,
        message: `💥 ${endpoint} - Request failed: ${error.message}`
      });
      
      return {
        endpoint,
        error: error.message
      };
    }
  }

  compareStructures(real, stub, endpoint) {
    const differences = [];
    
    // Check if both have success status
    if (real.status !== stub.status) {
      differences.push(`Status mismatch: real=${real.status}, stub=${stub.status}`);
    }

    // Compare data structures
    if (real.data && stub.data) {
      const realKeys = this.getObjectStructure(real.data);
      const stubKeys = this.getObjectStructure(stub.data);
      
      const missingInStub = realKeys.filter(key => !stubKeys.includes(key));
      const extraInStub = stubKeys.filter(key => !realKeys.includes(key));
      
      if (missingInStub.length > 0) {
        differences.push(`Missing in stub: ${missingInStub.join(', ')}`);
      }
      
      if (extraInStub.length > 0) {
        differences.push(`Extra in stub: ${extraInStub.join(', ')}`);
      }
    }

    return {
      isValid: differences.length === 0,
      differences
    };
  }

  getObjectStructure(obj, prefix = '') {
    const keys = [];
    
    if (Array.isArray(obj)) {
      if (obj.length > 0) {
        keys.push(...this.getObjectStructure(obj[0], prefix + '[0]'));
      }
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        keys.push(fullKey);
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          keys.push(...this.getObjectStructure(obj[key], fullKey));
        }
      });
    }
    
    return keys;
  }

  async runValidation() {
    console.log('\n🚀 Starting API-Stub validation...\n');

    // Test cases for different endpoints
    const testCases = [
      {
        endpoint: '/products',
        stubResponse: { status: 'success', data: { products: [], pagination: {} } },
        params: { limit: 5 }
      },
      {
        endpoint: '/categories',
        stubResponse: { status: 'success', data: { categories: [], pagination: {} } },
        params: { limit: 5 }
      },
      {
        endpoint: '/products/prod-1',
        stubResponse: { status: 'success', data: {} }
      },
      {
        endpoint: '/categories/cat-1',
        stubResponse: { status: 'success', data: { subcategories: [], products: [] } }
      }
    ];

    const results = [];
    
    for (const testCase of testCases) {
      const result = await this.validateEndpoint(
        testCase.endpoint,
        testCase.stubResponse,
        { params: testCase.params || {} }
      );
      results.push(result);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  async generateUpdatedStubs(validationResults) {
    console.log('\n📝 Analyzing results for stub updates...\n');
    
    const updates = [];
    
    for (const result of validationResults) {
      if (result.realData && result.validation && !result.validation.isValid) {
        updates.push({
          endpoint: result.endpoint,
          suggestedUpdate: this.generateStubFromReal(result.realData)
        });
      }
    }

    if (updates.length > 0) {
      console.log('🔧 Generating stub updates...');
      await this.writeStubUpdates(updates);
    } else {
      console.log('✅ All stubs are up to date!');
    }

    return updates;
  }

  generateStubFromReal(realData) {
    // Generate TypeScript mock data based on real API response
    if (realData.data) {
      if (Array.isArray(realData.data.products)) {
        return this.generateProductStubs(realData.data.products);
      }
      if (Array.isArray(realData.data.categories)) {
        return this.generateCategoryStubs(realData.data.categories);
      }
    }
    
    return realData;
  }

  generateProductStubs(products) {
    return products.slice(0, 3).map((product, index) => ({
      id: `prod-${index + 1}`,
      name: product.name || `Sample Product ${index + 1}`,
      description: product.description || `Description for product ${index + 1}`,
      price: product.price || (index + 1) * 29.99,
      category_id: product.category_id || `cat-${index + 1}`,
      image_url: product.image_url || `https://via.placeholder.com/400x400?text=Product+${index + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      inventory_count: product.inventory_count || 50,
      is_featured: product.is_featured || false,
      stripe_product_id: null
    }));
  }

  generateCategoryStubs(categories) {
    return categories.slice(0, 5).map((category, index) => ({
      id: `cat-${index + 1}`,
      name: category.name || `Category ${index + 1}`,
      description: category.description || `Description for category ${index + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      parent_id: null
    }));
  }

  async writeStubUpdates(updates) {
    const timestamp = new Date().toISOString();
    const updateFile = path.join(STUBS_DIR, `stub-updates-${timestamp.split('T')[0]}.json`);
    
    await fs.writeFile(updateFile, JSON.stringify(updates, null, 2));
    console.log(`📄 Stub updates written to: ${updateFile}`);
    
    // Also create a summary report
    const report = this.generateReport();
    const reportFile = path.join(STUBS_DIR, `validation-report-${timestamp.split('T')[0]}.md`);
    await fs.writeFile(reportFile, report);
    console.log(`📊 Validation report: ${reportFile}`);
  }

  generateReport() {
    const { passed, failed, warnings } = this.results;
    const total = passed.length + failed.length;
    const successRate = total > 0 ? Math.round((passed.length / total) * 100) : 0;

    return `# API-Stub Validation Report

Generated: ${new Date().toISOString()}

## Summary
- **Total Tests**: ${total}
- **Passed**: ${passed.length}
- **Failed**: ${failed.length}
- **Success Rate**: ${successRate}%

## ✅ Passed Tests
${passed.map(p => `- ${p.message}`).join('\n')}

## ❌ Failed Tests
${failed.map(f => `- ${f.message}\n  ${f.differences ? f.differences.map(d => `  - ${d}`).join('\n') : ''}`).join('\n')}

## ⚠️ Warnings
${warnings.map(w => `- ${w.message}`).join('\n')}

## Recommendations
${failed.length > 0 ? '- Update stub data to match real API responses\n- Review API schema changes\n- Update TypeScript types if needed' : '- All tests passed! Stubs are in sync 🎉'}
`;
  }

  async printResults() {
    console.log('\n📊 VALIDATION RESULTS\n');
    console.log('='.repeat(50));
    
    const { passed, failed, warnings } = this.results;
    const total = passed.length + failed.length;
    const successRate = total > 0 ? Math.round((passed.length / total) * 100) : 0;

    console.log(`✅ Passed: ${passed.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(`⚠️  Warnings: ${warnings.length}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log('='.repeat(50));

    if (failed.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      failed.forEach(f => {
        console.log(`\n${f.message}`);
        if (f.differences) {
          f.differences.forEach(diff => console.log(`   → ${diff}`));
        }
      });
    }

    if (passed.length > 0) {
      console.log('\n✅ PASSED TESTS:');
      passed.forEach(p => console.log(`${p.message}`));
    }

    console.log('\n');
  }
}

// CLI execution
async function main() {
  const validator = new APISyncValidator();
  
  if (!await validator.init()) {
    process.exit(1);
  }

  try {
    const results = await validator.runValidation();
    await validator.generateUpdatedStubs(results);
    await validator.printResults();
    
    if (validator.results.failed.length > 0) {
      console.log('💡 TIP: Run this script after making API changes to keep stubs in sync');
      process.exit(1);
    } else {
      console.log('🎉 All API endpoints and stubs are synchronized!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('💥 Validation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { APISyncValidator };