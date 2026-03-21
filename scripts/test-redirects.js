/**
 * SEO Redirects Test Script
 * Tests all configured redirects in vercel.json
 */

const fs = require('fs');
const path = require('path');

// Read vercel.json
const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const redirects = vercelConfig.redirects || [];

console.log('🔍 SEO Redirects Configuration Test\n');
console.log(`Total Redirects: ${redirects.length}\n`);

// Test redirect configuration
let passed = 0;
let failed = 0;
const issues = [];

redirects.forEach((redirect, index) => {
  const { source, destination, permanent } = redirect;
  
  // Test 1: Source and destination are defined
  if (!source || !destination) {
    failed++;
    issues.push(`❌ Redirect ${index + 1}: Missing source or destination`);
    return;
  }
  
  // Test 2: Source and destination are different
  if (source === destination) {
    failed++;
    issues.push(`❌ Redirect ${index + 1}: Source and destination are the same (${source})`);
    return;
  }
  
  // Test 3: Permanent flag is boolean
  if (typeof permanent !== 'boolean') {
    failed++;
    issues.push(`❌ Redirect ${index + 1}: Permanent flag must be boolean (${source} → ${destination})`);
    return;
  }
  
  // Test 4: No obvious redirect loops (basic check)
  const potentialLoop = redirects.find(r => 
    r.source === destination && r.destination === source
  );
  if (potentialLoop) {
    failed++;
    issues.push(`❌ Redirect ${index + 1}: Potential redirect loop detected (${source} ↔ ${destination})`);
    return;
  }
  
  // Test 5: Check for redirect chains (basic check)
  const chainRedirect = redirects.find(r => r.source === destination);
  if (chainRedirect) {
    issues.push(`⚠️  Redirect ${index + 1}: Potential redirect chain (${source} → ${destination} → ${chainRedirect.destination})`);
  }
  
  passed++;
});

// Display results
console.log('📊 Test Results:\n');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`⚠️  Warnings: ${issues.filter(i => i.startsWith('⚠️')).length}\n`);

if (issues.length > 0) {
  console.log('📋 Issues Found:\n');
  issues.forEach(issue => console.log(issue));
  console.log('');
}

// Redirect statistics
const permanentRedirects = redirects.filter(r => r.permanent === true).length;
const temporaryRedirects = redirects.filter(r => r.permanent === false).length;

console.log('📈 Redirect Statistics:\n');
console.log(`301 (Permanent): ${permanentRedirects}`);
console.log(`302 (Temporary): ${temporaryRedirects}`);
console.log(`Total: ${redirects.length}\n`);

// Group redirects by destination
const byDestination = {};
redirects.forEach(redirect => {
  const dest = redirect.destination;
  if (!byDestination[dest]) {
    byDestination[dest] = [];
  }
  byDestination[dest].push(redirect.source);
});

console.log('🎯 Popular Destinations:\n');
Object.entries(byDestination)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 5)
  .forEach(([dest, sources]) => {
    console.log(`${dest}: ${sources.length} redirect(s)`);
    sources.forEach(src => console.log(`  ← ${src}`));
  });

console.log('\n✅ Configuration test complete!');

// Exit with error code if there are failures
if (failed > 0) {
  console.log('\n❌ Some tests failed. Please fix the issues above.');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!');
  process.exit(0);
}
