# Quick Start: Integration Tests

## Run All Tests (2 minutes)

```bash
cd backend
npm test -- apply-page-integration.test.js
```

## What Gets Tested

1. **Complete Submission** - Full application flow from start to finish
2. **Draft Save/Restore** - Data persistence and recovery
3. **File Upload** - File management and limits
4. **Status Updates** - Status changes and history
5. **Withdrawal** - Withdrawal rules and restrictions
6. **Error Handling** - Validation and error scenarios

## Expected Output

```
PASS  backend/tests/apply-page-integration.test.js
  ✓ Complete submission flow (15 tests)
  
Test Suites: 1 passed
Tests:       15 passed
Time:        ~30s
```

## If Tests Fail

### Database Connection Error
```bash
# Start MongoDB
mongod

# Or use Docker
docker run -d -p 27017:27017 mongo
```

### Missing Dependencies
```bash
npm install
```

### Environment Variables
```bash
# Create .env file
MONGODB_TEST_URI=mongodb://localhost:27017/careerak-test
JWT_SECRET=your-test-secret
```

## Test Details

See `README_INTEGRATION_TESTS.md` for:
- Detailed test coverage
- Mocking requirements
- Troubleshooting guide
- Running specific tests

## Next Steps

After tests pass:
1. ✅ Integration tests complete
2. ⏭️ Run property-based tests
3. ⏭️ Run unit tests
4. ⏭️ Manual testing
5. ⏭️ Deploy to staging

## Quick Commands

```bash
# Run all tests
npm test -- apply-page-integration.test.js

# Run with coverage
npm test -- apply-page-integration.test.js --coverage

# Run specific suite
npm test -- apply-page-integration.test.js -t "Submission Flow"

# Watch mode
npm test -- apply-page-integration.test.js --watch
```

## Success Criteria

✅ All 15 tests pass  
✅ No errors or warnings  
✅ Coverage > 80%  
✅ Tests run in < 60 seconds  
