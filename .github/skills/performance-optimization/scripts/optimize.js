// Performance Optimization Script for Careerak Job Postings
// Run with: node .github/skills/performance-optimization/scripts/optimize.js

const { execSync } = require('child_process');
const path = require('path');

console.log('Running Careerak job postings performance optimizations...');

// Run Lighthouse on job postings page
try {
  console.log('Running Lighthouse audit...');
  execSync('npx lighthouse http://localhost:3000/jobs --output=json --output-path=./lighthouse-job-postings-report.json --config-path=./lighthouserc.json', { stdio: 'inherit' });
  console.log('Lighthouse audit completed for job postings page.');
} catch (error) {
  console.error('Lighthouse failed:', error.message);
}

// Bundle analysis for frontend
try {
  console.log('Analyzing frontend bundle...');
  const frontendPath = path.join(__dirname, '../../../frontend');
  execSync(`cd ${frontendPath} && npx webpack-bundle-analyzer build/static/js/*.js --output ./bundle-analysis.html`, { stdio: 'inherit' });
  console.log('Bundle analysis completed.');
} catch (error) {
  console.error('Bundle analysis failed:', error.message);
}

// Check API performance
try {
  console.log('Testing API endpoints...');
  execSync('node test-api.js', { cwd: path.join(__dirname, '../../../backend'), stdio: 'inherit' });
  console.log('API tests completed.');
} catch (error) {
  console.error('API tests failed:', error.message);
}

console.log('Performance optimizations and audits complete.');
console.log('Check lighthouse-job-postings-report.json and bundle-analysis.html for results.');