# Automated Contrast Checker

**Task**: 5.5.5 - Use automated contrast checker  
**Status**: ✅ Implemented  
**Date**: 2026-02-20

## Overview

The automated contrast checker ensures all color combinations in the Careerak platform meet WCAG 2.1 Level AA accessibility standards. It runs automatically in multiple contexts to catch contrast issues early.

## WCAG 2.1 Level AA Requirements

- **Normal text** (< 18pt or < 14pt bold): **4.5:1 minimum** contrast ratio
- **Large text** (≥ 18pt or ≥ 14pt bold): **3:1 minimum** contrast ratio
- **UI components and graphics**: **3:1 minimum** contrast ratio

## Features

### ✅ Automated Checking
- Runs on every commit (optional pre-commit hook)
- Runs in CI/CD pipeline (GitHub Actions)
- Can be run manually during development
- Generates JSON reports for tracking

### ✅ Comprehensive Coverage
- **Critical checks**: Must pass for deployment
- **Important checks**: Should pass for best accessibility
- **Large text checks**: Separate validation for headings
- **Known warnings**: Documents acceptable exceptions

### ✅ Developer-Friendly
- Color-coded terminal output
- Clear error messages
- Actionable recommendations
- Exit codes for CI/CD integration

## Usage

### Manual Check

Run the contrast checker manually:

```bash
cd frontend
npm run check:contrast
```

### CI/CD Integration

The checker runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

View results in GitHub Actions artifacts.

### Pre-Commit Hook (Optional)

Install the pre-commit hook to check before every commit:

```bash
# From project root
ln -s ../../frontend/scripts/pre-commit-contrast.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

To bypass the hook (not recommended):
```bash
git commit --no-verify
```

### In Development

Run the checker while developing:

```bash
# Watch mode (re-run on file changes)
cd frontend
npm run check:contrast

# Or integrate into your dev workflow
npm run dev & npm run check:contrast
```

## Exit Codes

The checker uses exit codes for CI/CD integration:

- **0**: All checks passed ✅
- **1**: Warnings detected (non-critical) ⚠️
- **2**: Critical failures detected ❌

## Check Categories

### 🔴 Critical Checks (Must Pass)

These combinations MUST meet WCAG AA standards:

1. Primary text on Secondary background (Light mode)
2. Primary text on White background
3. White text on Primary background
4. Dark text on Dark background (Dark mode)
5. Dark text on Dark surface (Dark mode)

**Failure**: Blocks deployment in CI/CD

### 🟡 Important Checks (Should Pass)

These combinations should meet standards for best accessibility:

1. Secondary text on Primary background
2. White text on Danger/Success backgrounds
3. Danger/Success text on Secondary background

**Failure**: Generates warnings but allows deployment

### 📏 Large Text Checks (≥18pt or ≥14pt bold)

Separate validation for large text (3:1 ratio required):

1. Large Primary text on Secondary background
2. Large Accent text on Secondary background
3. Large Dark text on Dark background

### ℹ️ Known Warnings (Acceptable)

These are documented exceptions for UI components:

1. Accent text on Secondary background (UI components only)
2. Accent text on White background (UI components only)

**Note**: These should NOT be used for body text content.

## Report Format

The checker generates a JSON report at `frontend/contrast-report.json`:

```json
{
  "timestamp": "2026-02-20T10:30:00.000Z",
  "wcagLevel": "AA",
  "results": {
    "critical": {
      "passed": [...],
      "failed": [...]
    },
    "important": {
      "passed": [...],
      "failed": [...]
    },
    "largeText": {
      "passed": [...],
      "failed": [...]
    },
    "warnings": {
      "passed": [...],
      "failed": [...]
    }
  },
  "summary": {
    "critical": {
      "total": 5,
      "passed": 5,
      "failed": 0
    },
    "important": {
      "total": 5,
      "passed": 5,
      "failed": 0
    },
    "largeText": {
      "total": 3,
      "passed": 3,
      "failed": 0
    }
  }
}
```

## Terminal Output

The checker provides color-coded terminal output:

```
================================================================================
AUTOMATED CONTRAST CHECKER REPORT
================================================================================

🔴 CRITICAL CHECKS (Must Pass):
✅ Passed: 5
❌ Failed: 0

🟡 IMPORTANT CHECKS (Should Pass):
✅ Passed: 5
⚠️  Failed: 0

📏 LARGE TEXT CHECKS (≥18pt or ≥14pt bold):
✅ Passed: 3
❌ Failed: 0

ℹ️  KNOWN WARNINGS (Acceptable for UI components):
✅ Passed: 0
ℹ️  Failed (Expected): 2

================================================================================
SUMMARY:
WCAG 2.1 Level AA Requirements:
  - Normal text: 4.5:1 minimum
  - Large text (≥18pt or ≥14pt bold): 3:1 minimum
================================================================================

✅ ALL CHECKS PASSED
All color combinations meet WCAG 2.1 Level AA standards.
```

## Integration with Existing Tools

The automated checker complements existing contrast utilities:

### `contrastAudit.js`
- Comprehensive audit of all color combinations
- Used by property-based tests
- Provides detailed analysis

### `contrastChecker.js`
- Dark mode specific validation
- Used for runtime checks
- Browser-based verification

### `browserContrastCheck.js`
- Live page contrast checking
- Developer console tool
- Real-time validation

### `runContrastAudit.js`
- Manual audit runner
- Development tool
- Detailed reporting

## Fixing Contrast Issues

If the checker reports failures:

### 1. Identify the Issue
```bash
npm run check:contrast
```

Look for the failing combination in the output.

### 2. Check Current Ratio
```javascript
import { getContrastRatio } from './utils/contrastAudit';

const ratio = getContrastRatio('#304B60', '#E3DAD1');
console.log(`Current ratio: ${ratio}:1`);
```

### 3. Adjust Colors

Options to fix contrast issues:

**Option A: Darken the text color**
```css
/* Before */
color: #9CA3AF; /* 2.8:1 - Fails */

/* After */
color: #6B7280; /* 4.6:1 - Passes */
```

**Option B: Lighten the background**
```css
/* Before */
background: #E3DAD1; /* 2.8:1 - Fails */

/* After */
background: #FFFFFF; /* 4.6:1 - Passes */
```

**Option C: Use for large text only**
```css
/* Mark as large text (≥18pt or ≥14pt bold) */
font-size: 18pt; /* or */
font-size: 14pt;
font-weight: 700;
```

### 4. Verify the Fix
```bash
npm run check:contrast
```

## Best Practices

### ✅ Do

- Run the checker before committing
- Fix critical failures immediately
- Address warnings when possible
- Use large text for lower contrast combinations
- Document acceptable exceptions
- Test in both light and dark modes

### ❌ Don't

- Bypass critical failures
- Use accent colors for body text
- Ignore warnings without reason
- Commit without checking
- Disable the checker in CI/CD
- Use `--no-verify` habitually

## Troubleshooting

### Checker Won't Run

```bash
# Ensure you're in the frontend directory
cd frontend

# Install dependencies
npm install

# Try running directly
node scripts/check-contrast.js
```

### False Positives

If you believe a check is incorrect:

1. Verify the color values are correct
2. Check if the text is actually large (≥18pt or ≥14pt bold)
3. Measure the contrast manually using a tool like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
4. If it's a legitimate exception, add it to the "warnings" category

### CI/CD Failures

If the checker fails in CI/CD:

1. Run locally: `npm run check:contrast`
2. Fix the reported issues
3. Commit and push the fixes
4. The CI/CD will re-run automatically

## Related Documentation

- [WCAG 2.1 Understanding Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Contrast Audit Utility](../frontend/src/utils/contrastAudit.js)
- [Contrast Checker Utility](../frontend/src/utils/contrastChecker.js)
- [Browser Contrast Check](../frontend/src/utils/browserContrastCheck.js)

## Maintenance

### Adding New Color Combinations

To add new combinations to check:

1. Edit `frontend/scripts/check-contrast.js`
2. Add to the appropriate category in `getColorCombinations()`
3. Run the checker to verify
4. Update this documentation

### Updating WCAG Standards

If WCAG standards change:

1. Update the `checkWCAGCompliance()` function
2. Update the required ratios
3. Update this documentation
4. Re-run all checks

## Future Enhancements

Planned improvements:

- [ ] Integration with Lighthouse CI
- [ ] Automated color suggestions
- [ ] Visual diff reports
- [ ] Slack/Discord notifications
- [ ] Historical trend tracking
- [ ] Per-component contrast checking
- [ ] Real-time browser extension

## Support

For issues or questions:

1. Check this documentation
2. Review the [contrast audit utility](../frontend/src/utils/contrastAudit.js)
3. Run the checker with verbose output
4. Contact the accessibility team

---

**Last Updated**: 2026-02-20  
**Maintained By**: Accessibility Team  
**WCAG Version**: 2.1 Level AA
