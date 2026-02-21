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

## Script Categories

### Accessibility
- `check-contrast.js` - Automated contrast checking
- `pre-commit-contrast.sh` - Pre-commit contrast validation

### Build & Deploy
- `generate-icons.js` - PWA icon generation

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

- [Automated Contrast Checker](../../docs/AUTOMATED_CONTRAST_CHECKER.md)
- [Quick Start Guide](../../docs/CONTRAST_CHECKER_QUICK_START.md)
- [Implementation Summary](../../docs/CONTRAST_CHECKING_SUMMARY.md)

---

**Last Updated**: 2026-02-20
