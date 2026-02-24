#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * 
 * Validates that all required environment variables are set
 * for both backend and frontend deployments.
 * 
 * Usage:
 *   node scripts/validate-env-vars.js [backend|frontend|all]
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Required environment variables
const REQUIRED_VARS = {
  backend: {
    critical: [
      'MONGODB_URI',
      'JWT_SECRET',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
      'PUSHER_APP_ID',
      'PUSHER_KEY',
      'PUSHER_SECRET',
      'PUSHER_CLUSTER',
    ],
    recommended: [
      'SESSION_SECRET',
      'FRONTEND_ENCRYPTION_KEY',
      'NODE_ENV',
      'PORT',
      'ADMIN_USERNAME',
      'ADMIN_PASSWORD',
    ],
    optional: [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'FACEBOOK_APP_ID',
      'FACEBOOK_APP_SECRET',
      'LINKEDIN_CLIENT_ID',
      'LINKEDIN_CLIENT_SECRET',
      'EMAIL_SERVICE',
      'EMAIL_USER',
      'EMAIL_PASSWORD',
    ],
  },
  frontend: {
    critical: [
      'VITE_API_URL',
      'VITE_PUSHER_KEY',
      'VITE_PUSHER_CLUSTER',
    ],
    recommended: [
      'VITE_APP_NAME',
      'VITE_APP_VERSION',
      'VITE_APP_URL',
      'VITE_ENCRYPTION_KEY',
    ],
    optional: [
      'VITE_ENABLE_ANALYTICS',
      'VITE_SENTRY_DSN',
      'VITE_GA_MEASUREMENT_ID',
      'VITE_DEBUG_MODE',
    ],
  },
};

// Validation rules
const VALIDATION_RULES = {
  MONGODB_URI: (value) => {
    if (!value.startsWith('mongodb://') && !value.startsWith('mongodb+srv://')) {
      return 'Must start with mongodb:// or mongodb+srv://';
    }
    return null;
  },
  JWT_SECRET: (value) => {
    if (value.length < 32) {
      return 'Should be at least 32 characters for security';
    }
    return null;
  },
  SESSION_SECRET: (value) => {
    if (value.length < 32) {
      return 'Should be at least 32 characters for security';
    }
    return null;
  },
  VITE_API_URL: (value) => {
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      return 'Must start with http:// or https://';
    }
    return null;
  },
  VITE_APP_URL: (value) => {
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      return 'Must start with http:// or https://';
    }
    return null;
  },
};

/**
 * Load environment variables from .env file
 */
function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};

  envContent.split('\n').forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;

    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });

  return env;
}

/**
 * Validate a single environment variable
 */
function validateVar(name, value, rule) {
  const issues = [];

  // Check if set
  if (!value || value === 'your_*' || value.includes('your_')) {
    issues.push('Not set or using placeholder value');
  }

  // Apply validation rule
  if (value && rule) {
    const error = rule(value);
    if (error) {
      issues.push(error);
    }
  }

  return issues;
}

/**
 * Validate environment variables for a target
 */
function validateEnvironment(target, env) {
  const results = {
    critical: { passed: [], failed: [] },
    recommended: { passed: [], failed: [] },
    optional: { passed: [], failed: [] },
  };

  const vars = REQUIRED_VARS[target];

  // Validate critical variables
  vars.critical.forEach((name) => {
    const value = env[name];
    const rule = VALIDATION_RULES[name];
    const issues = validateVar(name, value, rule);

    if (issues.length === 0) {
      results.critical.passed.push(name);
    } else {
      results.critical.failed.push({ name, issues });
    }
  });

  // Validate recommended variables
  vars.recommended.forEach((name) => {
    const value = env[name];
    const rule = VALIDATION_RULES[name];
    const issues = validateVar(name, value, rule);

    if (issues.length === 0) {
      results.recommended.passed.push(name);
    } else {
      results.recommended.failed.push({ name, issues });
    }
  });

  // Check optional variables
  vars.optional.forEach((name) => {
    const value = env[name];
    if (value && !value.includes('your_')) {
      results.optional.passed.push(name);
    }
  });

  return results;
}

/**
 * Print validation results
 */
function printResults(target, results) {
  console.log(`\n${colors.cyan}=== ${target.toUpperCase()} Environment Variables ===${colors.reset}\n`);

  // Critical variables
  console.log(`${colors.blue}Critical Variables (Required):${colors.reset}`);
  results.critical.passed.forEach((name) => {
    console.log(`  ${colors.green}✓${colors.reset} ${name}`);
  });
  results.critical.failed.forEach(({ name, issues }) => {
    console.log(`  ${colors.red}✗${colors.reset} ${name}`);
    issues.forEach((issue) => {
      console.log(`    ${colors.red}→${colors.reset} ${issue}`);
    });
  });

  // Recommended variables
  console.log(`\n${colors.blue}Recommended Variables:${colors.reset}`);
  results.recommended.passed.forEach((name) => {
    console.log(`  ${colors.green}✓${colors.reset} ${name}`);
  });
  results.recommended.failed.forEach(({ name, issues }) => {
    console.log(`  ${colors.yellow}⚠${colors.reset} ${name}`);
    issues.forEach((issue) => {
      console.log(`    ${colors.yellow}→${colors.reset} ${issue}`);
    });
  });

  // Optional variables
  if (results.optional.passed.length > 0) {
    console.log(`\n${colors.blue}Optional Variables (Set):${colors.reset}`);
    results.optional.passed.forEach((name) => {
      console.log(`  ${colors.green}✓${colors.reset} ${name}`);
    });
  }

  // Summary
  const criticalTotal = results.critical.passed.length + results.critical.failed.length;
  const criticalPassed = results.critical.passed.length;
  const recommendedTotal = results.recommended.passed.length + results.recommended.failed.length;
  const recommendedPassed = results.recommended.passed.length;

  console.log(`\n${colors.blue}Summary:${colors.reset}`);
  console.log(`  Critical: ${criticalPassed}/${criticalTotal} passed`);
  console.log(`  Recommended: ${recommendedPassed}/${recommendedTotal} passed`);
  console.log(`  Optional: ${results.optional.passed.length} set`);

  return results.critical.failed.length === 0;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const target = args[0] || 'all';

  console.log(`${colors.cyan}Environment Variables Validation${colors.reset}`);
  console.log(`${colors.cyan}=================================${colors.reset}`);

  let allPassed = true;

  if (target === 'backend' || target === 'all') {
    const backendEnvPath = path.join(__dirname, '..', 'backend', '.env');
    const backendEnv = loadEnvFile(backendEnvPath);
    const backendResults = validateEnvironment('backend', backendEnv);
    const passed = printResults('backend', backendResults);
    allPassed = allPassed && passed;
  }

  if (target === 'frontend' || target === 'all') {
    const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env');
    const frontendEnv = loadEnvFile(frontendEnvPath);
    const frontendResults = validateEnvironment('frontend', frontendEnv);
    const passed = printResults('frontend', frontendResults);
    allPassed = allPassed && passed;
  }

  // Final result
  console.log(`\n${colors.cyan}=================================${colors.reset}`);
  if (allPassed) {
    console.log(`${colors.green}✓ All critical variables are set!${colors.reset}`);
    console.log(`${colors.green}✓ Ready for deployment${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}✗ Some critical variables are missing or invalid${colors.reset}`);
    console.log(`${colors.red}✗ Fix issues before deploying${colors.reset}\n`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { validateEnvironment, loadEnvFile };
