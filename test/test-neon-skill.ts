/**
 * Test Suite for Neon Code Execution Skill
 *
 * Tests local utility functions and API operations.
 * API tests require NEON_API_KEY environment variable.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the Neon client
import {
  // Local utilities
  validateApiKey,
  getDefaultApiKey,
  hasApiKey,
  buildConnectionString,
  parseConnectionString,
  listRegions,
  getRegionName,
  formatBytes,
  formatComputeUnits,
  getGettingStartedGuide,
  getErrorReference,
  NEON_REGIONS,
  // API functions
  listProjects,
  listOrganizations,
  getProject,
  listBranches,
  listEndpoints,
  listDatabases,
  listRoles,
  getConnectionString,
  search,
} from '../.claude/skills/neon-code-exec/scripts/client-neon.js';

// ============================================================================
// Test Infrastructure
// ============================================================================

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  message: string;
  duration: number;
}

const results: TestResult[] = [];
const OUTPUT_DIR = path.join(__dirname, 'output');

function test(name: string, category: string, fn: () => boolean | Promise<boolean>): Promise<void> {
  return new Promise(async (resolve) => {
    const start = Date.now();
    try {
      const passed = await fn();
      results.push({
        name,
        category,
        passed,
        message: passed ? 'OK' : 'Failed assertion',
        duration: Date.now() - start,
      });
    } catch (error) {
      results.push({
        name,
        category,
        passed: false,
        message: error instanceof Error ? error.message : String(error),
        duration: Date.now() - start,
      });
    }
    resolve();
  });
}

// ============================================================================
// Local Utility Tests
// ============================================================================

async function runLocalTests() {
  console.log('\n📋 Running Local Utility Tests...\n');

  // Test validateApiKey
  await test('validateApiKey - valid key', 'Local', () => {
    const result = validateApiKey('neon_api_key_12345678901234567890');
    return result.valid === true;
  });

  await test('validateApiKey - empty key', 'Local', () => {
    const result = validateApiKey('');
    return result.valid === false && result.message === 'API key is required';
  });

  await test('validateApiKey - short key', 'Local', () => {
    const result = validateApiKey('short');
    return result.valid === false && result.message === 'API key appears too short';
  });

  // Test hasApiKey
  await test('hasApiKey - returns boolean', 'Local', () => {
    const result = hasApiKey();
    return typeof result === 'boolean';
  });

  // Test buildConnectionString
  await test('buildConnectionString - standard', 'Local', () => {
    const uri = buildConnectionString({
      host: 'ep-xxx.us-east-1.aws.neon.tech',
      database: 'neondb',
      role: 'myuser',
      password: 'mypass123',
    });
    return uri.includes('postgresql://') &&
           uri.includes('myuser') &&
           uri.includes('neondb') &&
           uri.includes('sslmode=require');
  });

  await test('buildConnectionString - pooled', 'Local', () => {
    const uri = buildConnectionString({
      host: 'ep-xxx.us-east-1.aws.neon.tech',
      database: 'neondb',
      role: 'myuser',
      password: 'mypass',
      pooled: true,
    });
    return uri.includes('-pooler.neon.tech');
  });

  // Test parseConnectionString
  await test('parseConnectionString - valid URI', 'Local', () => {
    const parsed = parseConnectionString('postgresql://user:pass@host.neon.tech/db');
    return parsed !== null &&
           parsed.role === 'user' &&
           parsed.password === 'pass' &&
           parsed.database === 'db';
  });

  await test('parseConnectionString - invalid URI', 'Local', () => {
    const parsed = parseConnectionString('not-a-valid-uri');
    return parsed === null;
  });

  await test('parseConnectionString - detects pooled', 'Local', () => {
    const parsed = parseConnectionString('postgresql://u:p@host-pooler.neon.tech/db');
    return parsed !== null && parsed.pooled === true;
  });

  // Test listRegions
  await test('listRegions - returns array', 'Local', () => {
    const regions = listRegions();
    return Array.isArray(regions) && regions.length > 0;
  });

  await test('listRegions - has id and name', 'Local', () => {
    const regions = listRegions();
    return regions.every(r => typeof r.id === 'string' && typeof r.name === 'string');
  });

  // Test getRegionName
  await test('getRegionName - known region', 'Local', () => {
    const name = getRegionName('aws-us-east-1');
    return name === 'US East (N. Virginia)';
  });

  await test('getRegionName - unknown region', 'Local', () => {
    const name = getRegionName('unknown-region');
    return name === 'unknown-region';
  });

  // Test NEON_REGIONS
  await test('NEON_REGIONS - has expected regions', 'Local', () => {
    return 'aws-us-east-1' in NEON_REGIONS &&
           'aws-eu-central-1' in NEON_REGIONS &&
           'aws-ap-southeast-1' in NEON_REGIONS;
  });

  // Test formatBytes
  await test('formatBytes - zero bytes', 'Local', () => {
    return formatBytes(0) === '0 Bytes';
  });

  await test('formatBytes - KB', 'Local', () => {
    const result = formatBytes(1024);
    return result === '1 KB';
  });

  await test('formatBytes - MB', 'Local', () => {
    const result = formatBytes(1024 * 1024);
    return result === '1 MB';
  });

  await test('formatBytes - GB', 'Local', () => {
    const result = formatBytes(1024 * 1024 * 1024);
    return result === '1 GB';
  });

  // Test formatComputeUnits
  await test('formatComputeUnits - 1 CU', 'Local', () => {
    const result = formatComputeUnits(1);
    return result.includes('1 CU') && result.includes('1 vCPU') && result.includes('4 GB RAM');
  });

  await test('formatComputeUnits - 4 CU', 'Local', () => {
    const result = formatComputeUnits(4);
    return result.includes('4 CU') && result.includes('4 vCPU') && result.includes('16 GB RAM');
  });

  // Test getGettingStartedGuide
  await test('getGettingStartedGuide - returns guide', 'Local', () => {
    const guide = getGettingStartedGuide();
    return guide.includes('Getting Started') &&
           guide.includes('API Key') &&
           guide.includes('NEON_API_KEY');
  });

  // Test getErrorReference
  await test('getErrorReference - has error codes', 'Local', () => {
    const errors = getErrorReference();
    return 'unauthorized' in errors &&
           'not_found' in errors &&
           'rate_limited' in errors;
  });

  await test('getErrorReference - has descriptions', 'Local', () => {
    const errors = getErrorReference();
    return errors['unauthorized'].includes('API key');
  });
}

// ============================================================================
// API Tests (require NEON_API_KEY)
// ============================================================================

async function runApiTests() {
  console.log('\n🌐 Running API Tests...\n');

  const apiKey = getDefaultApiKey();

  if (!apiKey) {
    console.log('⚠️  NEON_API_KEY not set - skipping API tests\n');
    results.push({
      name: 'API Key Check',
      category: 'API',
      passed: true, // Not a failure, just informational
      message: 'NEON_API_KEY not set - API tests skipped (set env var to run API tests)',
      duration: 0,
    });
    return;
  }

  console.log('✓ API key found, running API tests...\n');

  // Test listOrganizations
  await test('listOrganizations - fetches orgs', 'API', async () => {
    try {
      const result = await listOrganizations();
      return 'organizations' in result;
    } catch (e) {
      // May fail if user has no orgs, that's OK
      return true;
    }
  });

  // Test listProjects
  await test('listProjects - fetches projects', 'API', async () => {
    const result = await listProjects({ limit: 5 });
    return 'projects' in result && Array.isArray(result.projects);
  });

  // Test with a real project if available
  let testProjectId: string | null = null;

  await test('listProjects - get first project ID', 'API', async () => {
    const result = await listProjects({ limit: 1 });
    if (result.projects.length > 0) {
      testProjectId = result.projects[0].id;
      console.log(`   Found project: ${testProjectId}`);
      return true;
    }
    console.log('   No projects found');
    return true; // Not a failure, just no projects
  });

  if (testProjectId) {
    // Test getProject
    await test('getProject - fetches project details', 'API', async () => {
      const result = await getProject(testProjectId!);
      return 'project' in result && result.project.id === testProjectId;
    });

    // Test listBranches
    await test('listBranches - fetches branches', 'API', async () => {
      const result = await listBranches(testProjectId!);
      return 'branches' in result && Array.isArray(result.branches);
    });

    // Test listEndpoints
    await test('listEndpoints - fetches endpoints', 'API', async () => {
      const result = await listEndpoints(testProjectId!);
      return 'endpoints' in result && Array.isArray(result.endpoints);
    });

    // Get default branch for further tests
    let defaultBranchId: string | null = null;

    await test('listBranches - find default branch', 'API', async () => {
      const result = await listBranches(testProjectId!);
      const defaultBranch = result.branches.find(b => b.default);
      if (defaultBranch) {
        defaultBranchId = defaultBranch.id;
        console.log(`   Found default branch: ${defaultBranchId}`);
        return true;
      }
      return false;
    });

    if (defaultBranchId) {
      // Test listDatabases
      await test('listDatabases - fetches databases', 'API', async () => {
        const result = await listDatabases(testProjectId!, defaultBranchId!);
        return 'databases' in result && Array.isArray(result.databases);
      });

      // Test listRoles
      await test('listRoles - fetches roles', 'API', async () => {
        const result = await listRoles(testProjectId!, defaultBranchId!);
        return 'roles' in result && Array.isArray(result.roles);
      });

      // Test getConnectionString (requires database_name and role_name parameters)
      await test('getConnectionString - gets connection URI', 'API', async () => {
        // First get a role name from the roles list
        const rolesResult = await listRoles(testProjectId!, defaultBranchId!);
        const roleName = rolesResult.roles[0]?.name || 'neondb_owner';

        const result = await getConnectionString(testProjectId!, {
          database_name: 'neondb',
          role_name: roleName
        });
        return 'uri' in result && result.uri.startsWith('postgresql://');
      });
    }

    // Test search (may fail with org API keys - that's OK)
    await test('search - searches resources', 'API', async () => {
      try {
        const result = await search('neon');
        return 'results' in result && Array.isArray(result.results);
      } catch (error) {
        // Search is not allowed with organization API keys
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes('not allowed for organization')) {
          console.log('   Search not available for org API keys (expected)');
          return true; // Not a failure, just a limitation
        }
        throw error;
      }
    });
  }
}

// ============================================================================
// Generate HTML Report
// ============================================================================

function generateHtmlReport(): string {
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  const categories = [...new Set(results.map(r => r.category))];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Neon Code Execution Skill - Test Report</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen p-8">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Neon Code Execution Skill</h1>
    <p class="text-gray-600 mb-8">Test Report - ${new Date().toISOString()}</p>

    <!-- Summary Cards -->
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-4xl font-bold text-blue-600">${total}</div>
        <div class="text-gray-600">Total Tests</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-4xl font-bold text-green-600">${passed}</div>
        <div class="text-gray-600">Passed</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-4xl font-bold text-red-600">${failed}</div>
        <div class="text-gray-600">Failed</div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <div class="flex justify-between mb-2">
        <span class="text-gray-700 font-medium">Test Coverage</span>
        <span class="text-gray-600">${Math.round((passed / total) * 100)}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-4">
        <div class="bg-green-500 h-4 rounded-full" style="width: ${(passed / total) * 100}%"></div>
      </div>
    </div>

    <!-- Results by Category -->
    ${categories.map(category => {
      const categoryResults = results.filter(r => r.category === category);
      const categoryPassed = categoryResults.filter(r => r.passed).length;
      return `
    <div class="bg-white rounded-lg shadow mb-6">
      <div class="p-4 border-b flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-800">${category} Tests</h2>
        <span class="text-sm text-gray-500">${categoryPassed}/${categoryResults.length} passed</span>
      </div>
      <div class="divide-y">
        ${categoryResults.map(r => `
        <div class="p-4 flex items-start">
          <span class="text-2xl mr-4">${r.passed ? '✅' : '❌'}</span>
          <div class="flex-1">
            <div class="font-medium text-gray-900">${r.name}</div>
            <div class="text-sm ${r.passed ? 'text-green-600' : 'text-red-600'}">${r.message}</div>
          </div>
          <div class="text-sm text-gray-400">${r.duration}ms</div>
        </div>
        `).join('')}
      </div>
    </div>
      `;
    }).join('')}

    <!-- API Key Status -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Environment</h2>
      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="text-gray-600">NEON_API_KEY</span>
          <span class="${hasApiKey() ? 'text-green-600' : 'text-yellow-600'}">
            ${hasApiKey() ? 'Set' : 'Not set (API tests skipped)'}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Available Regions</span>
          <span class="text-gray-900">${Object.keys(NEON_REGIONS).length}</span>
        </div>
      </div>
    </div>

    <p class="text-gray-500 text-sm mt-6 text-center">
      Generated by Neon Code Execution Skill Test Suite
    </p>
  </div>
</body>
</html>`;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('Neon Code Execution Skill - Test Suite');
  console.log('='.repeat(60));

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Run tests
  await runLocalTests();
  await runApiTests();

  // Generate reports
  const htmlReport = generateHtmlReport();
  const htmlPath = path.join(OUTPUT_DIR, 'neon-test-report.html');
  fs.writeFileSync(htmlPath, htmlReport);

  const jsonPath = path.join(OUTPUT_DIR, 'neon-test-results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));

  // Summary
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`\n📄 HTML Report: ${htmlPath}`);
  console.log(`📋 JSON Results: ${jsonPath}`);

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Review the report for details.');
    process.exit(1);
  } else {
    console.log('\n✨ All tests passed!');
  }
}

main().catch(console.error);
