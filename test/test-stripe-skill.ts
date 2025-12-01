/**
 * Test Suite for Stripe Code Execution Skill
 *
 * Tests both local operations (no API key needed) and API operations (requires STRIPE_API_KEY).
 * Run with: npm run build && node dist/test/test-stripe-skill.js
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  // Local utilities
  isTestMode,
  isLiveMode,
  validateApiKey,
  getTestCard,
  getTestPaymentMethod,
  listTestCardScenarios,
  listTestPaymentMethods,
  formatAmount,
  toCents,
  getSandboxSetupGuide,
  getErrorCodeReference,
  TEST_CARDS,
  TEST_PAYMENT_METHODS,

  // API operations
  getAccount,
  getBalance,
  createCustomer,
  listCustomers,
  createProduct,
  listProducts,
  createPrice,
  listPrices,
  createPaymentIntent,
  confirmPaymentIntent,
  listPaymentIntents,
  createCoupon,
  listCoupons,
  deleteCoupon,
  deleteCustomer,
  deleteProduct,
  createProductWithPrice,
} from '../.claude/skills/stripe-code-exec/scripts/client-stripe.js';

// ============================================================================
// Test Infrastructure
// ============================================================================

const OUTPUT_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), 'output');

interface TestResult {
  category: string;
  test: string;
  success: boolean;
  details: string;
  duration?: number;
  error?: string;
}

const results: TestResult[] = [];
const createdObjects: { type: string; id: string }[] = [];

function addResult(category: string, test: string, success: boolean, details: string, duration?: number, error?: string) {
  results.push({ category, test, success, details, duration, error });
  const status = success ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
  console.log(`   ${status} ${test}: ${details}`);
}

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function generateHTMLReport(): string {
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const categories = [...new Set(results.map(r => r.category))];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Stripe Code Execution Skill - Test Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #635bff; }
    .summary { display: flex; gap: 20px; margin-bottom: 30px; }
    .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); flex: 1; text-align: center; }
    .summary-card.passed { border-top: 4px solid #28a745; }
    .summary-card.failed { border-top: 4px solid #dc3545; }
    .summary-card.total { border-top: 4px solid #635bff; }
    .summary-card h2 { margin: 0; font-size: 48px; }
    .summary-card p { margin: 10px 0 0; color: #666; }
    .category { background: white; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; }
    .category-header { background: #635bff; color: white; padding: 15px 20px; font-weight: bold; }
    .test-row { padding: 12px 20px; border-bottom: 1px solid #eee; display: flex; align-items: center; }
    .test-row:last-child { border-bottom: none; }
    .test-row.passed { background: #f8fff8; }
    .test-row.failed { background: #fff8f8; }
    .test-status { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; }
    .test-status.passed { background: #28a745; color: white; }
    .test-status.failed { background: #dc3545; color: white; }
    .test-name { flex: 1; font-weight: 500; }
    .test-details { color: #666; font-size: 14px; }
    .test-duration { color: #999; font-size: 12px; margin-left: 10px; }
    .test-error { color: #dc3545; font-size: 12px; margin-top: 5px; padding: 8px; background: #fff0f0; border-radius: 4px; }
    .footer { text-align: center; color: #999; margin-top: 30px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Stripe Code Execution Skill - Test Report</h1>
    <p>Generated: ${new Date().toISOString()}</p>

    <div class="summary">
      <div class="summary-card passed">
        <h2>${passed}</h2>
        <p>Passed</p>
      </div>
      <div class="summary-card failed">
        <h2>${failed}</h2>
        <p>Failed</p>
      </div>
      <div class="summary-card total">
        <h2>${results.length}</h2>
        <p>Total</p>
      </div>
    </div>

    ${categories.map(category => `
      <div class="category">
        <div class="category-header">${category}</div>
        ${results.filter(r => r.category === category).map(r => `
          <div class="test-row ${r.success ? 'passed' : 'failed'}">
            <div class="test-status ${r.success ? 'passed' : 'failed'}">${r.success ? '✓' : '✗'}</div>
            <div class="test-name">${r.test}</div>
            <div class="test-details">${r.details}</div>
            ${r.duration ? `<div class="test-duration">${r.duration}ms</div>` : ''}
          </div>
          ${r.error ? `<div class="test-error">${r.error}</div>` : ''}
        `).join('')}
      </div>
    `).join('')}

    <div class="footer">
      Stripe Code Execution Skill - Part of the From MCP to Code Execution project
    </div>
  </div>
</body>
</html>`;
}

// ============================================================================
// Local Tests (No API Key Required)
// ============================================================================

async function runLocalTests() {
  console.log('\n📋 LOCAL TESTS (No API Key Required)');
  console.log('=' .repeat(60));

  // Test 1: validateApiKey
  console.log('\n🔑 Test 1: API Key Validation');
  const start1 = Date.now();

  const testKey = validateApiKey('sk_test_123');
  addResult('Local', 'validateApiKey(sk_test_...)', testKey.valid && testKey.mode === 'test', `valid=${testKey.valid}, mode=${testKey.mode}`, Date.now() - start1);

  const liveKey = validateApiKey('sk_live_456');
  addResult('Local', 'validateApiKey(sk_live_...)', liveKey.valid && liveKey.mode === 'live', `valid=${liveKey.valid}, mode=${liveKey.mode}`);

  const invalidKey = validateApiKey('invalid_key');
  addResult('Local', 'validateApiKey(invalid)', !invalidKey.valid, `valid=${invalidKey.valid}, mode=${invalidKey.mode}`);

  // Test 2: isTestMode / isLiveMode
  console.log('\n🔍 Test 2: Mode Detection');
  const start2 = Date.now();

  addResult('Local', 'isTestMode(sk_test_...)', isTestMode('sk_test_123') === true, 'Returns true for test key', Date.now() - start2);
  addResult('Local', 'isTestMode(sk_live_...)', isTestMode('sk_live_123') === false, 'Returns false for live key');
  addResult('Local', 'isLiveMode(sk_live_...)', isLiveMode('sk_live_123') === true, 'Returns true for live key');

  // Test 3: Test Cards Catalog
  console.log('\n💳 Test 3: Test Cards Catalog');
  const start3 = Date.now();

  const scenarios = listTestCardScenarios();
  addResult('Local', 'listTestCardScenarios()', scenarios.length > 20, `${scenarios.length} scenarios available`, Date.now() - start3);

  const visaCard = getTestCard('visa');
  addResult('Local', 'getTestCard("visa")', visaCard === '4242424242424242', `Card: ${visaCard}`);

  const declineCard = getTestCard('decline_generic');
  addResult('Local', 'getTestCard("decline_generic")', declineCard === '4000000000000002', `Card: ${declineCard}`);

  // Test 4: Test Payment Methods
  console.log('\n💰 Test 4: Test Payment Methods');
  const start4 = Date.now();

  const pmTypes = listTestPaymentMethods();
  addResult('Local', 'listTestPaymentMethods()', pmTypes.length > 10, `${pmTypes.length} methods available`, Date.now() - start4);

  const visaPM = getTestPaymentMethod('visa');
  addResult('Local', 'getTestPaymentMethod("visa")', visaPM === 'pm_card_visa', `PM: ${visaPM}`);

  // Test 5: Amount Formatting
  console.log('\n💵 Test 5: Amount Formatting');
  const start5 = Date.now();

  const formatted = formatAmount(2999, 'usd');
  addResult('Local', 'formatAmount(2999, "usd")', formatted.includes('29.99'), `Formatted: ${formatted}`, Date.now() - start5);

  const cents = toCents(29.99);
  addResult('Local', 'toCents(29.99)', cents === 2999, `Cents: ${cents}`);

  // Test 6: Sandbox Guide
  console.log('\n📖 Test 6: Sandbox Guide');
  const start6 = Date.now();

  const guide = getSandboxSetupGuide();
  addResult('Local', 'getSandboxSetupGuide()', guide.includes('STRIPE SANDBOX') && guide.length > 500, `${guide.length} characters`, Date.now() - start6);

  // Test 7: Error Code Reference
  console.log('\n❌ Test 7: Error Code Reference');
  const start7 = Date.now();

  const errorCodes = getErrorCodeReference();
  addResult('Local', 'getErrorCodeReference()', Object.keys(errorCodes).length > 10, `${Object.keys(errorCodes).length} error codes`, Date.now() - start7);

  // Save test cards catalog
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'test-cards-catalog.json'),
    JSON.stringify({ TEST_CARDS, TEST_PAYMENT_METHODS, scenarios, pmTypes }, null, 2)
  );
  console.log(`   ✓ Saved test cards catalog to test-cards-catalog.json`);
}

// ============================================================================
// API Tests (Requires STRIPE_API_KEY)
// ============================================================================

async function runAPITests() {
  const apiKey = process.env.STRIPE_API_KEY;

  console.log('\n📡 API TESTS (Requires STRIPE_API_KEY)');
  console.log('=' .repeat(60));

  if (!apiKey) {
    console.log('\n⚠️  STRIPE_API_KEY not set - skipping API tests');
    console.log('   Set STRIPE_API_KEY=sk_test_... to run API tests');
    addResult('API', 'API Key Check', false, 'STRIPE_API_KEY not set', undefined, 'Set STRIPE_API_KEY environment variable');
    return;
  }

  const keyValidation = validateApiKey(apiKey);
  if (!keyValidation.valid) {
    addResult('API', 'API Key Validation', false, 'Invalid API key format', undefined, 'Key must start with sk_test_ or sk_live_');
    return;
  }

  if (!isTestMode(apiKey)) {
    console.log('\n⚠️  WARNING: Using LIVE mode API key!');
    console.log('   For safety, skipping write operations.');
    addResult('API', 'Mode Check', false, 'Live mode key detected - skipping write tests', undefined, 'Use sk_test_ key for safe testing');
  }

  console.log(`\n   Using ${keyValidation.mode} mode (${keyValidation.type} key)`);

  // Test: Get Account
  console.log('\n👤 Test: Account Info');
  try {
    const start = Date.now();
    const account = await getAccount();
    addResult('API', 'getAccount()', !!account.id, `Account: ${account.id}`, Date.now() - start);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'account.json'), JSON.stringify(account, null, 2));
  } catch (error: any) {
    addResult('API', 'getAccount()', false, 'Failed', undefined, error.message);
  }

  // Test: Get Balance
  console.log('\n💰 Test: Balance');
  try {
    const start = Date.now();
    const balance = await getBalance();
    const available = balance.available[0];
    addResult('API', 'getBalance()', !!balance.available, `Available: ${formatAmount(available?.amount || 0, available?.currency || 'usd')}`, Date.now() - start);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'balance.json'), JSON.stringify(balance, null, 2));
  } catch (error: any) {
    addResult('API', 'getBalance()', false, 'Failed', undefined, error.message);
  }

  // Test: List Customers
  console.log('\n👥 Test: List Customers');
  try {
    const start = Date.now();
    const customers = await listCustomers({ limit: 5 });
    addResult('API', 'listCustomers()', Array.isArray(customers.data), `${customers.data.length} customers (has_more: ${customers.has_more})`, Date.now() - start);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'customers-list.json'), JSON.stringify(customers, null, 2));
  } catch (error: any) {
    addResult('API', 'listCustomers()', false, 'Failed', undefined, error.message);
  }

  // Test: List Products
  console.log('\n📦 Test: List Products');
  try {
    const start = Date.now();
    const products = await listProducts({ limit: 5 });
    addResult('API', 'listProducts()', Array.isArray(products.data), `${products.data.length} products`, Date.now() - start);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'products-list.json'), JSON.stringify(products, null, 2));
  } catch (error: any) {
    addResult('API', 'listProducts()', false, 'Failed', undefined, error.message);
  }

  // Test: List Prices
  console.log('\n💲 Test: List Prices');
  try {
    const start = Date.now();
    const prices = await listPrices({ limit: 5 });
    addResult('API', 'listPrices()', Array.isArray(prices.data), `${prices.data.length} prices`, Date.now() - start);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'prices-list.json'), JSON.stringify(prices, null, 2));
  } catch (error: any) {
    addResult('API', 'listPrices()', false, 'Failed', undefined, error.message);
  }

  // Test: List Payment Intents
  console.log('\n💳 Test: List Payment Intents');
  try {
    const start = Date.now();
    const paymentIntents = await listPaymentIntents({ limit: 5 });
    addResult('API', 'listPaymentIntents()', Array.isArray(paymentIntents.data), `${paymentIntents.data.length} payment intents`, Date.now() - start);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'payment-intents-list.json'), JSON.stringify(paymentIntents, null, 2));
  } catch (error: any) {
    addResult('API', 'listPaymentIntents()', false, 'Failed', undefined, error.message);
  }

  // Test: List Coupons
  console.log('\n🎟️ Test: List Coupons');
  try {
    const start = Date.now();
    const coupons = await listCoupons({ limit: 5 });
    addResult('API', 'listCoupons()', Array.isArray(coupons.data), `${coupons.data.length} coupons`, Date.now() - start);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'coupons-list.json'), JSON.stringify(coupons, null, 2));
  } catch (error: any) {
    addResult('API', 'listCoupons()', false, 'Failed', undefined, error.message);
  }

  // Only run write operations in test mode
  if (isTestMode(apiKey)) {
    await runWriteTests();
  }
}

async function runWriteTests() {
  console.log('\n✏️ WRITE TESTS (Test Mode Only)');
  console.log('=' .repeat(60));

  // Test: Create Customer
  console.log('\n👤 Test: Create Customer');
  let customerId: string | null = null;
  try {
    const start = Date.now();
    const customer = await createCustomer({
      email: `test-${Date.now()}@example.com`,
      name: 'Test Customer',
      metadata: { test: 'true', created_by: 'stripe-code-exec-test' }
    });
    customerId = customer.id;
    createdObjects.push({ type: 'customer', id: customer.id });
    addResult('Write', 'createCustomer()', !!customer.id, `Created: ${customer.id}`, Date.now() - start);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'created-customer.json'), JSON.stringify(customer, null, 2));
  } catch (error: any) {
    addResult('Write', 'createCustomer()', false, 'Failed', undefined, error.message);
  }

  // Test: Create Product with Price
  console.log('\n📦 Test: Create Product with Price');
  let productId: string | null = null;
  let priceId: string | null = null;
  try {
    const start = Date.now();
    const { product, price } = await createProductWithPrice(
      { name: `Test Product ${Date.now()}`, description: 'Created by test suite', metadata: { test: 'true' } },
      { currency: 'usd', unit_amount: 999 }
    );
    productId = product.id;
    priceId = price.id;
    createdObjects.push({ type: 'product', id: product.id });
    addResult('Write', 'createProductWithPrice()', !!product.id && !!price.id, `Product: ${product.id}, Price: ${price.id}`, Date.now() - start);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'created-product-price.json'), JSON.stringify({ product, price }, null, 2));
  } catch (error: any) {
    addResult('Write', 'createProductWithPrice()', false, 'Failed', undefined, error.message);
  }

  // Test: Create Payment Intent
  console.log('\n💳 Test: Create Payment Intent');
  let paymentIntentId: string | null = null;
  try {
    const start = Date.now();
    const paymentIntent = await createPaymentIntent({
      amount: 2000,
      currency: 'usd',
      customer: customerId || undefined,
      metadata: { test: 'true' },
      automatic_payment_methods: { enabled: true }
    });
    paymentIntentId = paymentIntent.id;
    addResult('Write', 'createPaymentIntent()', !!paymentIntent.id && paymentIntent.status === 'requires_payment_method', `ID: ${paymentIntent.id}, Status: ${paymentIntent.status}`, Date.now() - start);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'created-payment-intent.json'), JSON.stringify(paymentIntent, null, 2));
  } catch (error: any) {
    addResult('Write', 'createPaymentIntent()', false, 'Failed', undefined, error.message);
  }

  // Test: Confirm Payment Intent with Test Card
  if (paymentIntentId) {
    console.log('\n✅ Test: Confirm Payment Intent');
    try {
      const start = Date.now();
      const confirmed = await confirmPaymentIntent(paymentIntentId, {
        payment_method: 'pm_card_visa'
      });
      addResult('Write', 'confirmPaymentIntent()', confirmed.status === 'succeeded', `Status: ${confirmed.status}`, Date.now() - start);
      fs.writeFileSync(path.join(OUTPUT_DIR, 'confirmed-payment-intent.json'), JSON.stringify(confirmed, null, 2));
    } catch (error: any) {
      addResult('Write', 'confirmPaymentIntent()', false, 'Failed', undefined, error.message);
    }
  }

  // Test: Create Coupon
  console.log('\n🎟️ Test: Create Coupon');
  let couponId: string | null = null;
  try {
    const start = Date.now();
    const coupon = await createCoupon({
      id: `test-coupon-${Date.now()}`,
      percent_off: 10,
      duration: 'once',
      metadata: { test: 'true' }
    });
    couponId = coupon.id;
    createdObjects.push({ type: 'coupon', id: coupon.id });
    addResult('Write', 'createCoupon()', !!coupon.id, `ID: ${coupon.id}, ${coupon.percent_off}% off`, Date.now() - start);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'created-coupon.json'), JSON.stringify(coupon, null, 2));
  } catch (error: any) {
    addResult('Write', 'createCoupon()', false, 'Failed', undefined, error.message);
  }

  // Cleanup: Delete created objects
  console.log('\n🧹 Cleanup: Deleting Test Objects');
  if (couponId) {
    try {
      await deleteCoupon(couponId);
      console.log(`   ✓ Deleted coupon: ${couponId}`);
    } catch (e) {
      console.log(`   ✗ Failed to delete coupon: ${couponId}`);
    }
  }
  if (productId) {
    try {
      await deleteProduct(productId);
      console.log(`   ✓ Deleted product: ${productId}`);
    } catch (e) {
      console.log(`   ✗ Failed to delete product: ${productId}`);
    }
  }
  if (customerId) {
    try {
      await deleteCustomer(customerId);
      console.log(`   ✓ Deleted customer: ${customerId}`);
    } catch (e) {
      console.log(`   ✗ Failed to delete customer: ${customerId}`);
    }
  }
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runTests() {
  console.log('============================================================');
  console.log('Testing Stripe Code Execution Skill');
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log('============================================================');

  ensureOutputDir();

  // Run local tests (always)
  await runLocalTests();

  // Run API tests (if key available)
  await runAPITests();

  // Generate reports
  console.log('\n============================================================');
  console.log('TEST SUMMARY');
  console.log('============================================================');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`\x1b[32m✅ Passed: ${passed}\x1b[0m`);
  console.log(`\x1b[31m❌ Failed: ${failed}\x1b[0m`);

  // Save results
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'test-results.json'),
    JSON.stringify({ passed, failed, total: results.length, results, createdObjects }, null, 2)
  );
  console.log(`\n📄 JSON Results: ${path.join(OUTPUT_DIR, 'test-results.json')}`);

  // Save HTML report
  const htmlReport = generateHTMLReport();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'test-report.html'), htmlReport);
  console.log(`📄 HTML Report: ${path.join(OUTPUT_DIR, 'test-report.html')}`);

  console.log(`📁 Output files: ${OUTPUT_DIR}/`);

  if (failed === 0) {
    console.log('\n\x1b[32m✅ All tests passed! Stripe skill is working correctly.\x1b[0m');
  } else {
    console.log(`\n\x1b[33m⚠️  ${failed} test(s) failed. Check the report for details.\x1b[0m`);
  }

  console.log(`\nTo view the report: open ${path.join(OUTPUT_DIR, 'test-report.html')}`);
}

// Run tests
runTests().catch(console.error);
