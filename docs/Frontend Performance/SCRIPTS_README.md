# Frontend Scripts

This directory contains utility scripts for the Careerak frontend.

## Available Scripts

### check-contrast.js

**Purpose**: Automated contrast checker for WCAG 2.1 Level AA compliance

**Usage**:
```bash
npm run check:contrast
```

**Features**:
- Checks all color combinations
- Generates JSON reports
- Color-coded terminal output
- Exit codes for CI/CD

**Documentation**: [AUTOMATED_CONTRAST_CHECKER.md](../../docs/AUTOMATED_CONTRAST_CHECKER.md)

### measure-load-time.js

**Purpose**: Measure load time improvements from performance optimizations

**Usage**:
```bash
npm run build
npm run measure:load-time
```

**Features**:
- Measures FCP, TTI, LCP, TBT, Speed Index
- Tests on Fast 3G network conditions
- Compares to baseline (40-60% improvement target)
- Generates detailed JSON reports
- Color-coded pass/fail output

**Documentation**: [LOAD_TIME_MEASUREMENT.md](../../docs/LOAD_TIME_MEASUREMENT.md), [README_LOAD_TIME.md](./README_LOAD_TIME.md)

### measure-bundle-size.js

**Purpose**: Measure bundle size reduction from code splitting and optimization

**Usage**:
```bash
npm run build
npm run measure:bundle
```

**Features**:
- Analyzes JS and CSS bundle sizes
- Compares to baseline (40-60% reduction target)
- Shows gzip and brotli compression
- Validates chunk size limits (< 200KB)
- Generates detailed JSON reports

### pre-commit-contrast.sh

**Purpose**: Pre-commit hook for contrast checking

**Installation**:
```bash
ln -s ../../frontend/scripts/pre-commit-contrast.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

**Features**:
- Runs before every commit
- Blocks critical failures
- Allows warnings with notice

### generate-icons.js

**Purpose**: Generate PWA icons in multiple sizes

**Usage**:
```bash
npm run generate-icons
```

**Features**:
- Generates 192x192 and 512x512 icons
- Creates maskable icons
- Optimizes for PWA

### generate-sitemap.js

**Purpose**: Generate sitemap.xml for SEO

**Usage**:
```bash
npm run generate-sitemap
```

**Features**:
- Includes all public routes
- Sets update frequency and priority
- Validates sitemap format

**Documentation**: [README_SITEMAP.md](./README_SITEMAP.md)

### generate-og-images.js

**Purpose**: Generate Open Graph social media preview images

**Usage**:
```bash
npm run generate-og-images
```

**Features**:
- Creates 1200x630 OG images
- Supports multiple languages
- Optimizes for social sharing

**Documentation**: [README_OG_IMAGES.md](./README_OG_IMAGES.md)

### test-slow-network.js

**Purpose**: Test application on slow network conditions

**Usage**:
```bash
npm run test:slow-network
```

**Features**:
- Simulates 3G network
- Tests load times
- Identifies performance issues

### mobile-test-helper.js

**Purpose**: Helper for mobile device testing

**Usage**:
```bash
npm run test:mobile-helper
```

**Features**:
- Mobile viewport simulation
- Touch event testing
- Responsive design validation

## Script Categories

### Performance Measurement
- `measure-load-time.js` - Load time improvement measurement
- `measure-bundle-size.js` - Bundle size reduction measurement
- `test-slow-network.js` - Slow network testing

### Accessibility
- `check-contrast.js` - Automated contrast checking
- `pre-commit-contrast.sh` - Pre-commit contrast validation

### SEO & Social
- `generate-sitemap.js` - Sitemap generation
- `generate-og-images.js` - Open Graph image generation
- `validate-sitemap.js` - Sitemap validation
- `validate-og-tags.js` - OG tags validation

### Build & Deploy
- `generate-icons.js` - PWA icon generation

### Testing
- `mobile-test-helper.js` - Mobile testing helper
- `test-slow-network.js` - Network throttling tests

## Adding New Scripts

When adding new scripts:

1. Create the script file in this directory
2. Add to `package.json` scripts section
3. Document in this README
4. Add usage examples
5. Create documentation if needed

## Best Practices

- Use Node.js for cross-platform scripts
- Use bash for Git hooks
- Include error handling
- Provide clear output
- Document exit codes
- Add to package.json

## Exit Codes

Scripts should use standard exit codes:

- **0**: Success
- **1**: Warning (non-critical)
- **2**: Error (critical)

## Documentation

For detailed documentation, see:

### Performance
- [Load Time Measurement](../../docs/LOAD_TIME_MEASUREMENT.md)
- [Load Time Quick Start](./README_LOAD_TIME.md)

### Accessibility
- [Automated Contrast Checker](../../docs/AUTOMATED_CONTRAST_CHECKER.md)
- [Quick Start Guide](../../docs/CONTRAST_CHECKER_QUICK_START.md)
- [Implementation Summary](../../docs/CONTRAST_CHECKING_SUMMARY.md)

### SEO
- [Sitemap Guide](./README_SITEMAP.md)
- [Open Graph Images](./README_OG_IMAGES.md)

---

**Last Updated**: 2026-02-22
