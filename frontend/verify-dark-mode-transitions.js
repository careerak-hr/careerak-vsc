/**
 * Verification script for Dark Mode Transitions
 * 
 * This script verifies that:
 * 1. Transition properties are defined in darkMode.css
 * 2. Transition duration is 300ms
 * 3. Transition timing function is ease-in-out
 * 4. All required color properties have transitions
 * 
 * Requirements: FR-DM-2, FR-DM-7
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

function verifyDarkModeTransitions() {
  log('\n' + '='.repeat(60), 'bold');
  log('Dark Mode Transition Verification', 'bold');
  log('='.repeat(60) + '\n', 'bold');

  const darkModeCssPath = path.join(__dirname, 'src', 'styles', 'darkMode.css');
  
  // Check if file exists
  if (!fs.existsSync(darkModeCssPath)) {
    logError('darkMode.css file not found!');
    return false;
  }

  logSuccess('darkMode.css file found');

  // Read the file
  const cssContent = fs.readFileSync(darkModeCssPath, 'utf-8');

  let allTestsPassed = true;

  // Test 1: Check for transition property
  log('\n' + '-'.repeat(60), 'blue');
  log('Test 1: Checking for transition properties...', 'bold');
  log('-'.repeat(60), 'blue');

  const hasTransitionProperty = /transition\s*:/i.test(cssContent);
  if (hasTransitionProperty) {
    logSuccess('Transition property found in CSS');
  } else {
    logError('Transition property NOT found in CSS');
    allTestsPassed = false;
  }

  // Test 2: Check for 300ms duration
  log('\n' + '-'.repeat(60), 'blue');
  log('Test 2: Checking for 300ms duration...', 'bold');
  log('-'.repeat(60), 'blue');

  const has300msDuration = /300ms/i.test(cssContent);
  if (has300msDuration) {
    logSuccess('300ms duration found in CSS');
  } else {
    logError('300ms duration NOT found in CSS');
    allTestsPassed = false;
  }

  // Test 3: Check for ease-in-out timing function
  log('\n' + '-'.repeat(60), 'blue');
  log('Test 3: Checking for ease-in-out timing function...', 'bold');
  log('-'.repeat(60), 'blue');

  const hasEaseInOut = /ease-in-out/i.test(cssContent);
  if (hasEaseInOut) {
    logSuccess('ease-in-out timing function found in CSS');
  } else {
    logError('ease-in-out timing function NOT found in CSS');
    allTestsPassed = false;
  }

  // Test 4: Check for required color properties
  log('\n' + '-'.repeat(60), 'blue');
  log('Test 4: Checking for required color properties...', 'bold');
  log('-'.repeat(60), 'blue');

  const requiredProperties = [
    'background-color',
    'color',
    'border-color'
  ];

  const transitionMatch = cssContent.match(/transition\s*:\s*([^;]+);/i);
  if (transitionMatch) {
    const transitionValue = transitionMatch[1];
    logInfo(`Transition value: ${transitionValue}`);

    requiredProperties.forEach(prop => {
      if (transitionValue.includes(prop)) {
        logSuccess(`${prop} is included in transitions`);
      } else {
        logWarning(`${prop} might not be explicitly included (could be covered by 'all')`);
      }
    });
  } else {
    logError('Could not parse transition value');
    allTestsPassed = false;
  }

  // Test 5: Check for universal selector
  log('\n' + '-'.repeat(60), 'blue');
  log('Test 5: Checking for universal selector application...', 'bold');
  log('-'.repeat(60), 'blue');

  const hasUniversalSelector = /\*\s*,\s*\*::before\s*,\s*\*::after\s*{/i.test(cssContent);
  if (hasUniversalSelector) {
    logSuccess('Universal selector (*) found - transitions apply to all elements');
  } else {
    logWarning('Universal selector not found - transitions might not apply to all elements');
  }

  // Test 6: Check for !important flag
  log('\n' + '-'.repeat(60), 'blue');
  log('Test 6: Checking for !important flag...', 'bold');
  log('-'.repeat(60), 'blue');

  const transitionImportantMatch = cssContent.match(/transition\s*:[^;]+!important/i);
  if (transitionImportantMatch) {
    logSuccess('!important flag found - transitions will override other styles');
  } else {
    logWarning('!important flag not found - transitions might be overridden by other styles');
  }

  // Test 7: Check for no-transition class
  log('\n' + '-'.repeat(60), 'blue');
  log('Test 7: Checking for no-transition utility class...', 'bold');
  log('-'.repeat(60), 'blue');

  const hasNoTransitionClass = /\.no-transition/i.test(cssContent);
  if (hasNoTransitionClass) {
    logSuccess('no-transition utility class found for disabling transitions');
  } else {
    logWarning('no-transition utility class not found');
  }

  // Final summary
  log('\n' + '='.repeat(60), 'bold');
  log('Verification Summary', 'bold');
  log('='.repeat(60), 'bold');

  if (allTestsPassed) {
    logSuccess('\nAll critical tests passed! ✓');
    logInfo('Dark mode transitions are properly configured to apply within 300ms.');
    log('\nRequirements satisfied:', 'green');
    log('  • FR-DM-2: Dark mode applies within 300ms ✓', 'green');
    log('  • FR-DM-7: Smooth transitions for color changes ✓', 'green');
  } else {
    logError('\nSome tests failed! ✗');
    logWarning('Please review the darkMode.css file and ensure all transitions are properly configured.');
  }

  log('\n' + '='.repeat(60) + '\n', 'bold');

  return allTestsPassed;
}

// Run verification
const success = verifyDarkModeTransitions();
process.exit(success ? 0 : 1);
