# Backend Scripts

This directory contains utility scripts for monitoring, maintenance, and operations.

---

## Available Scripts

### 1. Error Rate Tracking

**File**: `track-error-rates.js`

**Purpose**: Monitor and analyze error rates from frontend error logs

**Usage**:
```bash
# Basic usage
node scripts/track-error-rates.js

# With npm scripts
npm run track:errors                    # Track last 24 hours
npm run track:errors:production         # Production only
npm run track:errors:watch              # Continuous monitoring
npm run track:errors:export             # Export to JSON
```

**Features**:
- Real-time error rate calculation
- Historical trend analysis
- Multi-dimensional breakdown (component, environment, level)
- Recovery rate tracking
- Alerting system
- Watch mode for continuous monitoring
- Export to JSON/CSV

**Documentation**:
- 📄 `docs/ERROR_RATE_TRACKING.md` - Complete guide
- 📄 `docs/ERROR_RATE_TRACKING_QUICK_START.md` - Quick start (5 min)

**Requirements**:
- MongoDB connection
- Error logging system active
- Node.js 14+

**Examples**:
```bash
# Track production errors in last 48 hours
node scripts/track-error-rates.js --period 48 --environment production

# Watch mode with 30 second interval
node scripts/track-error-rates.js --watch --interval 30

# Export to JSON
node scripts/track-error-rates.js --export json > error-rates.json

# Track specific component with alert threshold
node scripts/track-error-rates.js --component ProfilePage --threshold 5
```

---

## Adding New Scripts

When adding new scripts to this directory:

1. **Create the script file**:
   ```bash
   touch scripts/my-new-script.js
   ```

2. **Add shebang** (for direct execution):
   ```javascript
   #!/usr/bin/env node
   ```

3. **Make executable** (Linux/Mac):
   ```bash
   chmod +x scripts/my-new-script.js
   ```

4. **Add npm script** (in `package.json`):
   ```json
   {
     "scripts": {
       "my-script": "node scripts/my-new-script.js"
     }
   }
   ```

5. **Document it**:
   - Add to this README
   - Create documentation in `docs/`
   - Add usage examples

6. **Test it**:
   ```bash
   node scripts/my-new-script.js --help
   npm run my-script
   ```

---

## Script Guidelines

### Structure

```javascript
#!/usr/bin/env node

/**
 * Script Name
 * 
 * Description of what the script does
 * 
 * Requirements:
 * - List requirements
 * 
 * Usage:
 *   node scripts/script-name.js [options]
 */

// Imports
const mongoose = require('mongoose');
const path = require('path');

// Load environment
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Parse arguments
const args = process.argv.slice(2);

// Main function
async function main() {
  // Script logic
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('Error:', error);
  process.exit(1);
});

// Run
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Best Practices

1. **Always include help**:
   ```javascript
   if (args.includes('--help')) {
     console.log('Usage: ...');
     process.exit(0);
   }
   ```

2. **Handle errors gracefully**:
   ```javascript
   try {
     // Code
   } catch (error) {
     console.error('Error:', error.message);
     process.exit(1);
   }
   ```

3. **Close connections**:
   ```javascript
   await mongoose.connection.close();
   process.exit(0);
   ```

4. **Use environment variables**:
   ```javascript
   require('dotenv').config();
   const mongoUri = process.env.MONGODB_URI;
   ```

5. **Provide feedback**:
   ```javascript
   console.log('✓ Operation completed');
   console.error('✗ Operation failed');
   ```

6. **Support options**:
   ```javascript
   const options = {
     verbose: args.includes('--verbose'),
     dryRun: args.includes('--dry-run'),
   };
   ```

---

## Common Patterns

### MongoDB Connection

```javascript
const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}
```

### Argument Parsing

```javascript
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--option':
      options.option = args[++i];
      break;
    case '--flag':
      options.flag = true;
      break;
  }
}
```

### Progress Reporting

```javascript
const total = 100;
for (let i = 0; i < total; i++) {
  const percent = Math.round((i / total) * 100);
  process.stdout.write(`\rProgress: ${percent}%`);
}
console.log('\n✓ Complete');
```

### Export Formats

```javascript
// JSON
console.log(JSON.stringify(data, null, 2));

// CSV
console.log('Column1,Column2,Column3');
data.forEach(row => {
  console.log(`${row.col1},${row.col2},${row.col3}`);
});

// Table
console.log('╔════════════════════════════════════╗');
console.log('║         Report Title               ║');
console.log('╚════════════════════════════════════╝');
```

---

## Testing Scripts

### Manual Testing

```bash
# Test help
node scripts/script-name.js --help

# Test with options
node scripts/script-name.js --option value

# Test error handling
node scripts/script-name.js --invalid-option

# Test output
node scripts/script-name.js > output.txt
```

### Automated Testing

```javascript
// scripts/__tests__/script-name.test.js
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

describe('Script Name', () => {
  it('should show help', async () => {
    const { stdout } = await execPromise('node scripts/script-name.js --help');
    expect(stdout).toContain('Usage:');
  });

  it('should handle errors', async () => {
    try {
      await execPromise('node scripts/script-name.js --invalid');
    } catch (error) {
      expect(error.code).toBe(1);
    }
  });
});
```

---

## Maintenance

### Regular Tasks

- Review script logs weekly
- Update dependencies monthly
- Test scripts after major changes
- Document new features
- Archive old/unused scripts

### Monitoring

- Check script execution logs
- Monitor resource usage
- Track execution time
- Review error rates

---

## Support

For issues or questions:
- Check script documentation in `docs/`
- Review error logs: `backend/logs/`
- Contact: careerak.hr@gmail.com

---

**Last Updated**: 2026-02-22  
**Scripts**: 1  
**Status**: ✅ Active
