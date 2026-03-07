#!/usr/bin/env node

/**
 * Integration Test Runner
 * Runs all integration tests for Apply Page Enhancements
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     Apply Page Enhancements - Integration Tests           ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const testFiles = [
  'tests/integration/application-flow.integration.test.js',
  'tests/integration/application-error-scenarios.integration.test.js',
  'tests/integration/application-edge-cases.integration.test.js'
];

const results = {
  passed: 0,
  failed: 0,
  total: testFiles.length
};

testFiles.forEach((testFile, index) => {
  console.log(`\n[${ index + 1}/${testFiles.length}] Running: ${path.basename(testFile)}`);
  console.log('─'.repeat(60));

  try {
    execSync(`npm test -- ${testFile}`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    results.passed++;
    console.log(`✅ PASSED: ${path.basename(testFile)}\n`);
  } catch (error) {
    results.failed++;
    console.log(`❌ FAILED: ${path.basename(testFile)}\n`);
  }
});

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                    Test Summary                            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log(`Total Test Files: ${results.total}`);
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);

if (results.failed === 0) {
  console.log('\n🎉 All integration tests passed!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review the output above.\n');
  process.exit(1);
}
