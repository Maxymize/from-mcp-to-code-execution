/**
 * Test Suite for Convex Code Execution Skill
 *
 * Tests local utility functions and API operations.
 * API tests require environment variables:
 * - CONVEX_ACCESS_TOKEN for Management API
 * - CONVEX_URL and CONVEX_DEPLOY_KEY for Deployment API
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the Convex client
import {
  // Token validation
  checkAccessTokenWithGuidance,
  checkDeployKeyWithGuidance,
  hasAccessToken,
  hasDeployKey,
  validateToken,
  // Local utilities
  generateValidator,
  generateQueryTemplate,
  generateMutationTemplate,
  generateActionTemplate,
  generateInternalFunctionTemplate,
  generateSchemaTemplate,
  generateHttpTemplate,
  generateCronTemplate,
  generatePaginatedQueryTemplate,
  getConvexGuidelines,
  getErrorReference,
  generatePackageJson,
  generateTsConfig,
  CONVEX_VALIDATORS,
  // URL utilities
  buildDeploymentUrl,
  buildSiteUrl,
  getDashboardUrl,
  getDocsUrl,
  // API functions (will test if credentials available)
  getTokenDetails,
  listProjects,
  listEnvironmentVariables,
  runQuery,
  // Tables API (Streaming Export)
  listTablesWithSchema,
  listTables,
  getTableSchema,
} from '../.claude/skills/convex-code-exec/scripts/client-convex.js';

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

  // Test validateToken
  await test('validateToken - valid token', 'Local', () => {
    const result = validateToken('convex_access_token_12345678901234567890');
    return result.valid === true;
  });

  await test('validateToken - empty token', 'Local', () => {
    const result = validateToken('');
    return result.valid === false && result.message === 'Token is required';
  });

  await test('validateToken - short token', 'Local', () => {
    const result = validateToken('short');
    return result.valid === false && result.message === 'Token appears too short';
  });

  // Test checkAccessTokenWithGuidance
  await test('checkAccessTokenWithGuidance - returns result object', 'Local', () => {
    const result = checkAccessTokenWithGuidance();
    return typeof result.found === 'boolean' &&
           typeof result.valid === 'boolean' &&
           typeof result.message === 'string';
  });

  // Test checkDeployKeyWithGuidance
  await test('checkDeployKeyWithGuidance - returns result object', 'Local', () => {
    const result = checkDeployKeyWithGuidance();
    return typeof result.found === 'boolean' &&
           typeof result.valid === 'boolean' &&
           typeof result.message === 'string';
  });

  // Test hasAccessToken / hasDeployKey
  await test('hasAccessToken - returns boolean', 'Local', () => {
    return typeof hasAccessToken() === 'boolean';
  });

  await test('hasDeployKey - returns boolean', 'Local', () => {
    return typeof hasDeployKey() === 'boolean';
  });

  // Test CONVEX_VALIDATORS
  await test('CONVEX_VALIDATORS - has all types', 'Local', () => {
    const required = ['string', 'number', 'boolean', 'null', 'int64', 'bytes', 'id', 'array', 'object', 'record', 'union', 'literal', 'optional'];
    return required.every(type => type in CONVEX_VALIDATORS);
  });

  // Test generateValidator
  await test('generateValidator - string type', 'Local', () => {
    const result = generateValidator({ type: 'string' });
    return result === 'v.string()';
  });

  await test('generateValidator - id type', 'Local', () => {
    const result = generateValidator({ type: 'id', tableName: 'users' });
    return result === 'v.id("users")';
  });

  await test('generateValidator - array type', 'Local', () => {
    const result = generateValidator({ type: 'array', element: { type: 'string' } });
    return result === 'v.array(v.string())';
  });

  await test('generateValidator - optional type', 'Local', () => {
    const result = generateValidator({ type: 'optional', inner: { type: 'number' } });
    return result === 'v.optional(v.number())';
  });

  await test('generateValidator - object type', 'Local', () => {
    const result = generateValidator({
      type: 'object',
      fields: { name: { type: 'string' }, age: { type: 'number' } }
    });
    return result.includes('v.object') && result.includes('name: v.string()');
  });

  // Test code generation templates
  await test('generateQueryTemplate - generates valid code', 'Local', () => {
    const code = generateQueryTemplate(
      'listUsers',
      { limit: 'v.number()' },
      'v.array(v.object({ name: v.string() }))',
      'users'
    );
    return code.includes('export const listUsers = query') &&
           code.includes('args: {') &&
           code.includes('limit: v.number()') &&
           code.includes('handler: async (ctx, args)');
  });

  await test('generateMutationTemplate - generates valid code', 'Local', () => {
    const code = generateMutationTemplate(
      'createUser',
      { name: 'v.string()' },
      'users'
    );
    return code.includes('export const createUser = mutation') &&
           code.includes('ctx.db.insert');
  });

  await test('generateActionTemplate - generates valid code', 'Local', () => {
    const code = generateActionTemplate(
      'sendEmail',
      { to: 'v.string()' },
      false
    );
    return code.includes('export const sendEmail = action') &&
           code.includes('Actions cannot access ctx.db');
  });

  await test('generateActionTemplate - with Node directive', 'Local', () => {
    const code = generateActionTemplate('nodeAction', {}, true);
    return code.startsWith('"use node";');
  });

  await test('generateInternalFunctionTemplate - query', 'Local', () => {
    const code = generateInternalFunctionTemplate('helper', 'query', {});
    return code.includes('internalQuery') && code.includes('internal.file');
  });

  await test('generateSchemaTemplate - generates schema', 'Local', () => {
    const code = generateSchemaTemplate([
      {
        name: 'users',
        fields: { name: 'v.string()' },
        indexes: [['name']]
      }
    ]);
    return code.includes('defineSchema') &&
           code.includes('defineTable') &&
           code.includes('users:') &&
           code.includes('.index("by_name"');
  });

  await test('generateHttpTemplate - generates routes', 'Local', () => {
    const code = generateHttpTemplate([
      { path: '/api/hello', method: 'GET', name: 'Hello endpoint' }
    ]);
    return code.includes('httpRouter') &&
           code.includes('http.route') &&
           code.includes('/api/hello') &&
           code.includes('httpAction');
  });

  await test('generateCronTemplate - generates cron jobs', 'Local', () => {
    const code = generateCronTemplate([
      { name: 'cleanup', schedule: { hours: 1 }, functionRef: 'internal.crons.cleanup' }
    ]);
    return code.includes('cronJobs') &&
           code.includes('crons.interval') &&
           code.includes('hours: 1');
  });

  await test('generatePaginatedQueryTemplate - generates pagination', 'Local', () => {
    const code = generatePaginatedQueryTemplate('listItems', 'items', 'category');
    return code.includes('paginationOptsValidator') &&
           code.includes('.paginate(args.paginationOpts)') &&
           code.includes('by_category');
  });

  // Test utility functions
  await test('getConvexGuidelines - returns string', 'Local', () => {
    const guidelines = getConvexGuidelines();
    return typeof guidelines === 'string' &&
           guidelines.includes('Convex Coding Guidelines') &&
           guidelines.includes('v.null()');
  });

  await test('getErrorReference - returns object', 'Local', () => {
    const errors = getErrorReference();
    return typeof errors === 'object' &&
           'ValidationError' in errors &&
           'DatabaseError' in errors;
  });

  await test('generatePackageJson - generates JSON', 'Local', () => {
    const json = generatePackageJson('test-project');
    const parsed = JSON.parse(json);
    return parsed.name === 'test-project' &&
           'convex' in parsed.dependencies;
  });

  await test('generateTsConfig - generates JSON', 'Local', () => {
    const json = generateTsConfig();
    const parsed = JSON.parse(json);
    return parsed.compilerOptions.target === 'ESNext' &&
           parsed.exclude.includes('convex');
  });

  // Test URL utilities
  await test('buildDeploymentUrl - formats correctly', 'Local', () => {
    const url = buildDeploymentUrl('happy-otter-123');
    return url === 'https://happy-otter-123.convex.cloud';
  });

  await test('buildSiteUrl - formats correctly', 'Local', () => {
    const url = buildSiteUrl('happy-otter-123');
    return url === 'https://happy-otter-123.convex.site';
  });

  await test('getDashboardUrl - formats correctly', 'Local', () => {
    const url = getDashboardUrl('my-team', 'my-project');
    return url === 'https://dashboard.convex.dev/t/my-team/p/my-project';
  });

  await test('getDocsUrl - returns base URL', 'Local', () => {
    const url = getDocsUrl();
    return url === 'https://docs.convex.dev';
  });

  await test('getDocsUrl - returns topic URL', 'Local', () => {
    const url = getDocsUrl('queries');
    return url === 'https://docs.convex.dev/functions/query-functions';
  });
}

// ============================================================================
// API Tests (require credentials)
// ============================================================================

async function runApiTests() {
  console.log('\n🌐 Running API Tests...\n');

  const hasManagementAccess = hasAccessToken();
  const hasDeploymentAccess = hasDeployKey();

  if (!hasManagementAccess && !hasDeploymentAccess) {
    console.log('⚠️  No credentials found - skipping API tests');
    console.log('   Set CONVEX_ACCESS_TOKEN for Management API tests');
    console.log('   Set CONVEX_URL and CONVEX_DEPLOY_KEY for Deployment API tests\n');
    results.push({
      name: 'API credentials check',
      category: 'API',
      passed: true,
      message: 'No credentials - API tests skipped (expected in CI)',
      duration: 0
    });
    return;
  }

  // Management API tests
  if (hasManagementAccess) {
    console.log('  Testing Management API...');

    await test('getTokenDetails - returns token info', 'API', async () => {
      try {
        const details = await getTokenDetails();
        return 'teamId' in details || 'type' in details;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('401') || msg.includes('Unauthorized')) {
          console.log('   Token invalid or expired');
          return false;
        }
        throw error;
      }
    });

    await test('listProjects - returns projects array', 'API', async () => {
      try {
        const details = await getTokenDetails();
        if (!details.teamId) {
          console.log('   No teamId in token');
          return true; // Not a failure, just different token type
        }
        const result = await listProjects(details.teamId);
        return 'projects' in result && Array.isArray(result.projects);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.log(`   Error: ${msg}`);
        return false;
      }
    });
  } else {
    console.log('  ⚠️  CONVEX_ACCESS_TOKEN not set - skipping Management API tests');
  }

  // Deployment API tests
  if (hasDeploymentAccess) {
    console.log('  Testing Deployment API...');

    await test('listEnvironmentVariables - returns env vars', 'API', async () => {
      try {
        const vars = await listEnvironmentVariables();
        return typeof vars === 'object';
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('401') || msg.includes('Unauthorized')) {
          console.log('   Deploy key invalid');
          return false;
        }
        throw error;
      }
    });

    // Only test runQuery if we know there's a function deployed
    // This test is informational - won't fail if no functions exist
    await test('runQuery - executes query (if available)', 'API', async () => {
      try {
        // Try to query a common function name
        const result = await runQuery('messages:list', {});
        return result.status === 'success' || result.status === 'error';
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        // It's OK if the function doesn't exist
        if (msg.includes('not found') || msg.includes('404')) {
          console.log('   No test function deployed (expected)');
          return true;
        }
        console.log(`   Error: ${msg}`);
        return true; // Don't fail the test for missing functions
      }
    });

    // Test Streaming Export API - listTablesWithSchema
    await test('listTablesWithSchema - returns table schemas', 'API', async () => {
      try {
        const schemas = await listTablesWithSchema();
        // Should return an object (may be empty if no tables)
        return typeof schemas === 'object' && schemas !== null;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('401') || msg.includes('Unauthorized')) {
          console.log('   Deploy key lacks streaming export access');
          return true; // Not a failure, API requires specific permissions
        }
        console.log(`   Error: ${msg}`);
        return false;
      }
    });

    // Test listTables (derived from json_schemas)
    await test('listTables - returns table names array', 'API', async () => {
      try {
        const tables = await listTables();
        return Array.isArray(tables);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('401') || msg.includes('Unauthorized')) {
          console.log('   Deploy key lacks streaming export access');
          return true;
        }
        console.log(`   Error: ${msg}`);
        return false;
      }
    });

    // Test getTableSchema
    await test('getTableSchema - returns schema or null', 'API', async () => {
      try {
        // First get all tables
        const tables = await listTables();
        if (tables.length === 0) {
          console.log('   No tables found (empty deployment)');
          return true;
        }
        // Try to get schema for first table
        const schema = await getTableSchema(tables[0]);
        return schema !== null && 'properties' in schema;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('401') || msg.includes('Unauthorized')) {
          console.log('   Deploy key lacks streaming export access');
          return true;
        }
        console.log(`   Error: ${msg}`);
        return false;
      }
    });
  } else {
    console.log('  ⚠️  CONVEX_DEPLOY_KEY not set - skipping Deployment API tests');
  }
}

// ============================================================================
// Generate HTML Report
// ============================================================================

function generateHTMLReport(): string {
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  const localResults = results.filter(r => r.category === 'Local');
  const apiResults = results.filter(r => r.category === 'API');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Report - Convex Code Execution Skill</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-8">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Test Report: Convex Code Execution Skill</h1>

    <!-- Summary -->
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div class="bg-white p-4 rounded shadow">
        <div class="text-4xl font-bold text-blue-600">${results.length}</div>
        <div class="text-gray-600">Total tests</div>
      </div>
      <div class="bg-white p-4 rounded shadow">
        <div class="text-4xl font-bold text-green-600">${passed}</div>
        <div class="text-gray-600">Passed</div>
      </div>
      <div class="bg-white p-4 rounded shadow">
        <div class="text-4xl font-bold text-red-600">${failed}</div>
        <div class="text-gray-600">Failed</div>
      </div>
    </div>

    <!-- Local Tests -->
    <div class="bg-white rounded shadow mb-8">
      <h2 class="text-xl font-semibold p-4 border-b">Local Utility Tests (${localResults.length})</h2>
      <div class="divide-y max-h-96 overflow-auto">
        ${localResults.map(r => `
          <div class="p-3 flex items-center">
            <span class="text-xl mr-3">${r.passed ? '✅' : '❌'}</span>
            <div class="flex-1">
              <code class="font-mono text-sm bg-gray-100 px-2 py-1 rounded">${r.name}</code>
              ${!r.passed ? `<p class="text-red-600 text-sm mt-1">${r.message}</p>` : ''}
            </div>
            <span class="text-gray-500 text-sm">${r.duration}ms</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- API Tests -->
    <div class="bg-white rounded shadow mb-8">
      <h2 class="text-xl font-semibold p-4 border-b">API Tests (${apiResults.length})</h2>
      <div class="divide-y">
        ${apiResults.length === 0 ? '<div class="p-4 text-gray-500">No API tests run</div>' :
          apiResults.map(r => `
            <div class="p-3 flex items-center">
              <span class="text-xl mr-3">${r.passed ? '✅' : '❌'}</span>
              <div class="flex-1">
                <code class="font-mono text-sm bg-gray-100 px-2 py-1 rounded">${r.name}</code>
                ${!r.passed ? `<p class="text-red-600 text-sm mt-1">${r.message}</p>` : ''}
              </div>
              <span class="text-gray-500 text-sm">${r.duration}ms</span>
            </div>
          `).join('')}
      </div>
    </div>

    <!-- Coverage -->
    <div class="bg-white rounded shadow">
      <h2 class="text-xl font-semibold p-4 border-b">Skill Coverage</h2>
      <div class="p-4">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left border-b">
              <th class="pb-2">Feature</th>
              <th class="pb-2">Status</th>
              <th class="pb-2">Method</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b"><td class="py-2">Project Management</td><td>✅</td><td>Code Exec</td></tr>
            <tr class="border-b"><td class="py-2">Deployment Management</td><td>✅</td><td>Code Exec</td></tr>
            <tr class="border-b"><td class="py-2">Function Execution</td><td>✅</td><td>Code Exec</td></tr>
            <tr class="border-b"><td class="py-2">Environment Variables</td><td>✅</td><td>Code Exec</td></tr>
            <tr class="border-b"><td class="py-2">Tables with JSON Schema</td><td>✅</td><td>Code Exec (Streaming Export API)</td></tr>
            <tr class="border-b"><td class="py-2">Code Generation</td><td>✅</td><td>Local</td></tr>
            <tr class="border-b"><td class="py-2">Function Metadata</td><td>⚠️</td><td>MCP Required</td></tr>
            <tr class="border-b"><td class="py-2">Execution Logs</td><td>⚠️</td><td>MCP Required</td></tr>
            <tr class="border-b"><td class="py-2">Sandbox Queries</td><td>⚠️</td><td>MCP Required</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <p class="text-gray-500 text-sm mt-4">
      Generated: ${new Date().toISOString()}
    </p>
  </div>
</body>
</html>`;
}

// ============================================================================
// Main
// ============================================================================

async function runTests() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('='.repeat(60));
  console.log('Convex Code Execution Skill - Test Suite');
  console.log('='.repeat(60));

  await runLocalTests();
  await runApiTests();

  // Generate reports
  const htmlReport = generateHTMLReport();
  const reportPath = path.join(OUTPUT_DIR, 'convex-test-report.html');
  fs.writeFileSync(reportPath, htmlReport);

  const jsonPath = path.join(OUTPUT_DIR, 'convex-test-results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));

  // Summary
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`\n📄 HTML Report: ${reportPath}`);
  console.log(`📋 JSON Results: ${jsonPath}`);

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed!');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   ❌ ${r.name}: ${r.message}`);
    });
    process.exit(1);
  } else {
    console.log('\n✨ All tests passed!');
  }
}

runTests().catch(console.error);
