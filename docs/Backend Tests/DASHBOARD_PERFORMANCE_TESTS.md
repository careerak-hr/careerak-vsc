# Dashboard Performance Property-Based Tests

## Overview

This document describes the property-based tests for **Property 32: Dashboard Load Performance** from the Admin Dashboard Enhancements specification.

## Property 32: Dashboard Load Performance

**Validates: Requirements 11.1**

*For any* dashboard load, the initial content should be visible and interactive within 2 seconds of the page load starting, measured from navigation start to first contentful paint.

## Test Structure

The performance tests are organized into 5 main property groups:

### Property 32.1: Statistics Refresh Performance

Tests that statistics queries complete within 500ms for various dataset sizes.

**Test Cases:**
- `should fetch user statistics within 500ms for small datasets` (100 runs)
  - Tests with 10-100 users
  - Validates query time < 500ms
  
- `should fetch job statistics within 500ms for small datasets` (100 runs)
  - Tests with 10-50 jobs
  - Validates query time < 500ms
  
- `should benefit from caching on repeated queries` (50 runs)
  - Tests that cached queries are faster or similar
  - Validates both queries < 500ms
  
- `should handle concurrent statistics queries efficiently` (50 runs)
  - Tests 3 concurrent queries
  - Validates total time < 1000ms (not 3x single query time)

### Property 32.2: Dashboard Load Time

Tests that complete dashboard data load completes within 2 seconds.

**Test Cases:**
- `should load all dashboard statistics within 2 seconds` (100 runs)
  - Tests with 50-200 users, 20-100 jobs, 10-50 courses
  - Loads all statistics in parallel
  - Validates total time < 2000ms
  
- `should maintain performance with larger datasets`
  - Tests with small (100 users, 50 jobs), medium (500 users, 200 jobs), and large (1000 users, 500 jobs) datasets
  - Validates all sizes < 2000ms

### Property 32.3: Query Optimization

Tests that database indexes are utilized effectively.

**Test Cases:**
- `should use indexes for date range queries` (20 runs)
  - Tests with 100-500 users
  - Validates index usage (not COLLSCAN)
  - Validates query time < 500ms
  
- `should perform aggregations efficiently` (50 runs)
  - Tests with 100-300 users
  - Tests grouping by role
  - Validates aggregation time < 500ms

### Property 32.4: Memory Efficiency

Tests that queries use memory efficiently.

**Test Cases:**
- `should use lean queries to reduce memory overhead` (20 runs)
  - Tests with 100-500 users
  - Validates memory increase < 50MB
  - Validates query time < 500ms
  
- `should handle pagination efficiently` (50 runs)
  - Tests with 100-300 total users, 10-50 page size
  - Validates paginated query < 200ms
  - Validates correct page size returned

### Property 32.5: Scalability

Tests that performance scales sub-linearly with dataset size.

**Test Cases:**
- `should scale sub-linearly with dataset size`
  - Tests with 100, 200, 400, 800 users
  - Validates time ratio < size ratio (sub-linear scaling)
  - Validates all queries < 500ms

## Performance Requirements

| Metric | Target | Validates |
|--------|--------|-----------|
| Dashboard load time | < 2 seconds | Requirement 11.1 |
| Statistics refresh | < 500ms | Requirement 11.1 |
| Paginated query | < 200ms | Requirement 11.1 |
| Memory overhead | < 50MB | Requirement 11.1 |
| Scalability | Sub-linear | Requirement 11.1 |

## Running the Tests

```bash
# Run all performance tests
npm test -- dashboard-performance.property.test.js

# Run with verbose output
npm test -- dashboard-performance.property.test.js --verbose

# Run specific test suite
npm test -- dashboard-performance.property.test.js -t "Statistics Refresh Performance"

# Run with memory profiling (requires --expose-gc flag)
node --expose-gc node_modules/.bin/jest dashboard-performance.property.test.js
```

## Test Configuration

- **Library**: fast-check
- **Minimum runs per property**: 100 iterations (50-100 depending on complexity)
- **Database**: MongoDB (test database)
- **Timeout**: 300-600 seconds per test suite

## Performance Measurement

The tests use `process.hrtime.bigint()` for high-precision timing:

```javascript
const measureExecutionTime = async (fn) => {
  const start = process.hrtime.bigint();
  const result = await fn();
  const end = process.hrtime.bigint();
  const durationMs = Number(end - start) / 1_000_000;
  return { result, durationMs };
};
```

## Test Data

All test data uses the `test-perf-` prefix for easy cleanup:
- Users: `test-perf-user-{timestamp}-{index}@test.com`
- Jobs: `test-perf-job-{timestamp}-{index}`
- Courses: `test-perf-course-{timestamp}-{index}`

## Cleanup

Each test cleans up after itself:
- Deletes all test data after each test
- Clears cache after each test
- Closes database connection after all tests

## Interpreting Results

### Success Criteria

✅ **All tests pass** - Dashboard meets performance requirements

### Common Issues

❌ **Query time > 500ms**
- Check database indexes
- Review query complexity
- Consider caching strategy

❌ **Dashboard load > 2 seconds**
- Check if queries are running in parallel
- Review network latency
- Check for N+1 query problems

❌ **Memory usage > 50MB**
- Ensure using `.lean()` queries
- Check for memory leaks
- Review data structure size

❌ **Non-linear scaling**
- Verify indexes are being used
- Check for full collection scans
- Review aggregation pipeline

## Integration with CI/CD

These tests should be run:
- Before merging PRs
- After database schema changes
- Weekly performance regression tests
- Before production deployments

## Related Documentation

- [Design Document](.kiro/specs/admin-dashboard-enhancements/design.md) - Property 32
- [Requirements](.kiro/specs/admin-dashboard-enhancements/requirements.md) - Requirement 11.1
- [Statistics Service](../src/services/statisticsService.js) - Implementation

## Notes

- Tests require MongoDB connection
- Tests will skip if MongoDB is unavailable
- Cache is cleared between tests to ensure accurate measurements
- Tests use realistic data sizes (100-1000 records)
- Performance targets are based on typical production loads
