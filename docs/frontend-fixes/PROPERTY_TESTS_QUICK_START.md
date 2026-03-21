# Property Tests Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies (1 minute)

```bash
# Backend
cd backend
npm install --save-dev fast-check

# Frontend
cd frontend
npm install --save-dev fast-check
```

### 2. Review Resources (2 minutes)

- **Full Guide**: `PROPERTY_TESTS_GUIDE.md` - Comprehensive documentation
- **Example Test**: `EXAMPLE_PROPERTY_TEST.js` - Working template
- **Status Tracker**: `PROPERTY_TESTS_STATUS.md` - Track progress

### 3. Run Test Suite (1 minute)

```bash
# Linux/Mac
chmod +x run-property-tests.sh
./run-property-tests.sh

# Windows
run-property-tests.bat
```

### 4. Implement First Test (1 minute to understand)

Copy `EXAMPLE_PROPERTY_TEST.js` and modify for your property:

```javascript
const fc = require('fast-check');

describe('Feature: apply-page-enhancements, Property X: [Name]', () => {
  it('should [property description]', () => {
    fc.assert(
      fc.property(
        // Your arbitrary (data generator)
        fc.record({ /* ... */ }),
        // Your test function
        async (data) => {
          // Arrange, Act, Assert
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

## Implementation Order

Follow tasks.md order for systematic implementation:

1. **Backend APIs** (Tasks 2-4): Properties 2, 4, 5, 9, 15
2. **Frontend State** (Tasks 6-8): Properties 1, 3, 6, 12, 16, 17, 21, 24, 25
3. **UI Components** (Tasks 10-12): Properties 7, 11, 13, 14, 18, 19
4. **Status & Notifications** (Tasks 14-16): Properties 8, 10, 20
5. **Supporting Components** (Task 17): Properties 22, 23

## Quick Test Commands

```bash
# Run all property tests
npm test -- --testPathPattern=property.test.js

# Run specific test
npm test -- auto-fill-completeness.property.test.js

# Run with verbose output
npm test -- --verbose --testPathPattern=property.test.js

# Run with coverage
npm test -- --coverage --testPathPattern=property.test.js
```

## Common Patterns

### Pattern 1: Data Transfer Test
```javascript
fc.property(userProfileArbitrary, async (profile) => {
  const form = await autoFill(profile);
  expect(form.education).toHaveLength(profile.education.length);
});
```

### Pattern 2: Round-Trip Test
```javascript
fc.property(draftDataArbitrary, async (draft) => {
  const saved = await saveDraft(draft);
  const loaded = await loadDraft(saved.id);
  expect(loaded).toEqual(draft);
});
```

### Pattern 3: Validation Test
```javascript
fc.property(fileArbitrary, (file) => {
  const result = validateFile(file);
  if (isValidType(file) && file.size <= MAX_SIZE) {
    expect(result.valid).toBe(true);
  } else {
    expect(result.valid).toBe(false);
  }
});
```

## Success Checklist

- [ ] fast-check installed
- [ ] Example test reviewed
- [ ] Test runner works
- [ ] First test implemented
- [ ] All 25 tests implemented
- [ ] All tests pass with 100+ iterations
- [ ] Status document updated

## Need Help?

1. Check `PROPERTY_TESTS_GUIDE.md` for detailed documentation
2. Review `EXAMPLE_PROPERTY_TEST.js` for working code
3. Check fast-check docs: https://github.com/dubzzz/fast-check
4. Review tasks.md for implementation context

## Next Steps

1. Start with Task 2.2 (Draft round-trip test)
2. Follow tasks.md order
3. Update PROPERTY_TESTS_STATUS.md as you go
4. Run test suite frequently
5. Ensure all 25 tests pass before marking task complete
