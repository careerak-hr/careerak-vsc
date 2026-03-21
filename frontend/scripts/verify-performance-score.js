/**
 * Performance Score Verification Script
 * 
 * This script provides multiple methods to verify the Lighthouse Performance score
 * since automated Lighthouse audits fail on Windows due to permission issues.
 */

const fs = require('fs');
const path = require('path');

console.log('\n🎯 Performance Score Verification Guide\n');
console.log('=' .repeat(60));

// Check if build exists
const buildPath = path.join(__dirname, 'build');
if (!fs.existsSync(buildPath)) {
  console.error('\n❌ Error: build folder not found!');
  console.log('Please run "npm run build" first.\n');
  process.exit(1);
}

// Analyze bundle sizes
console.log('\n📦 Bundle Size Analysis:\n');

let chunks = [];
const jsPath = path.join(buildPath, 'assets', 'js');
if (fs.existsSync(jsPath)) {
  const files = fs.readdirSync(jsPath);
  const jsFiles = files.filter(f => f.endsWith('.js') && !f.endsWith('.map'));
  
  let totalSize = 0;
  
  jsFiles.forEach(file => {
    const filePath = path.join(jsPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    totalSize += stats.size;
    
    chunks.push({ file, size: stats.size, sizeKB });
  });
  
  // Sort by size descending
  chunks.sort((a, b) => b.size - a.size);
  
  // Show top 10 largest chunks
  console.log('Top 10 Largest Chunks:');
  chunks.slice(0, 10).forEach((chunk, i) => {
    const icon = chunk.size > 200 * 1024 ? '⚠️' : '✅';
    console.log(`  ${icon} ${i + 1}. ${chunk.file}: ${chunk.sizeKB} KB`);
  });
  
  const totalMB = (totalSize / 1024 / 1024).toFixed(2);
  console.log(`\n📊 Total JS Size: ${totalMB} MB (${chunks.length} files)`);
  
  // Check if any chunk exceeds 200KB
  const largeChunks = chunks.filter(c => c.size > 200 * 1024);
  if (largeChunks.length > 0) {
    console.log(`\n⚠️  Warning: ${largeChunks.length} chunk(s) exceed 200KB:`);
    largeChunks.forEach(chunk => {
      console.log(`  - ${chunk.file}: ${chunk.sizeKB} KB`);
    });
  } else {
    console.log('\n✅ All chunks are under 200KB!');
  }
}

// Analyze CSS
const cssPath = path.join(buildPath, 'assets', 'css');
if (fs.existsSync(cssPath)) {
  const files = fs.readdirSync(cssPath);
  const cssFiles = files.filter(f => f.endsWith('.css'));
  
  let totalCssSize = 0;
  cssFiles.forEach(file => {
    const filePath = path.join(cssPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    totalCssSize += stats.size;
    console.log(`\n📄 CSS: ${file}: ${sizeKB} KB`);
  });
  
  const totalCssMB = (totalCssSize / 1024 / 1024).toFixed(2);
  console.log(`📊 Total CSS Size: ${totalCssMB} MB`);
}

console.log('\n' + '='.repeat(60));
console.log('\n📈 Performance Score Estimation:\n');

// Estimate performance score based on bundle sizes
if (chunks.length > 0) {
  const mainChunk = chunks.find(c => c.file.includes('index-'));
  const vendorChunks = chunks.filter(c => c.file.includes('vendor'));
  const totalVendorSize = vendorChunks.reduce((sum, c) => sum + c.size, 0);
  const largeChunks = chunks.filter(c => c.size > 200 * 1024);

  console.log(`Main App Chunk: ${mainChunk ? mainChunk.sizeKB + ' KB' : 'Not found'}`);
  console.log(`Total Vendor Size: ${(totalVendorSize / 1024).toFixed(2)} KB`);

  // Scoring logic (simplified)
  let estimatedScore = 100;

  // Penalize for large main chunk
  if (mainChunk && mainChunk.size > 150 * 1024) {
    estimatedScore -= 5;
  }
  if (mainChunk && mainChunk.size > 200 * 1024) {
    estimatedScore -= 5;
  }

  // Penalize for large vendor chunks
  if (totalVendorSize > 500 * 1024) {
    estimatedScore -= 3;
  }
  if (totalVendorSize > 800 * 1024) {
    estimatedScore -= 5;
  }

  // Penalize for any chunk > 200KB (except lazy-loaded ones like zxcvbn)
  const criticalLargeChunks = largeChunks.filter(c => !c.file.includes('zxcvbn'));
  criticalLargeChunks.forEach(() => {
    estimatedScore -= 2;
  });

  console.log(`\n🎯 Estimated Performance Score: ${estimatedScore}/100`);

  if (estimatedScore >= 90) {
    console.log('✅ Likely to meet 90+ target!');
  } else {
    console.log('⚠️  May need additional optimizations');
  }
} else {
  console.log('⚠️  No chunks found for analysis');
}

console.log('\n' + '='.repeat(60));
console.log('\n📋 Verification Methods:\n');

console.log('Method 1: PageSpeed Insights (Recommended)');
console.log('  1. Visit: https://pagespeed.web.dev/');
console.log('  2. Enter URL: https://careerak-vsc.vercel.app/');
console.log('  3. Click "Analyze"');
console.log('  4. Check Performance score\n');

console.log('Method 2: Chrome DevTools Lighthouse');
console.log('  1. Serve build: npx serve build -p 3001');
console.log('  2. Open Chrome: http://localhost:3001');
console.log('  3. Press F12 → Lighthouse tab');
console.log('  4. Select "Performance" category');
console.log('  5. Click "Analyze page load"\n');

console.log('Method 3: Vercel Analytics');
console.log('  1. Log in to Vercel dashboard');
console.log('  2. Navigate to Careerak project');
console.log('  3. Go to "Analytics" tab');
console.log('  4. Review Core Web Vitals\n');

console.log('=' .repeat(60));
console.log('\n✅ Verification guide complete!\n');
