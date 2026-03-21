#!/bin/bash

# Property-Based Tests Runner for Apply Page Enhancements
# This script runs all 25 property tests with 100+ iterations

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Apply Page Enhancements - Property Tests Runner         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=25
PASSED=0
FAILED=0
SKIPPED=0

# Test files array
declare -a BACKEND_TESTS=(
  "backend/tests/auto-fill-completeness.property.test.js"
  "backend/tests/draft-round-trip.property.test.js"
  "backend/tests/draft-deletion.property.test.js"
  "backend/tests/file-validation.property.test.js"
  "backend/tests/file-removal.property.test.js"
  "backend/tests/withdrawal-restrictions.property.test.js"
  "backend/tests/withdrawal-completeness.property.test.js"
  "backend/tests/status-notifications.property.test.js"
  "backend/tests/custom-answer-persistence.property.test.js"
  "backend/tests/backend-persistence.property.test.js"
  "backend/tests/user-modifications-persistence.property.test.js"
  "backend/tests/empty-profile-handling.property.test.js"
)

declare -a FRONTEND_TESTS=(
  "frontend/tests/navigation-preservation.property.test.js"
  "frontend/tests/step-validation.property.test.js"
  "frontend/tests/backward-navigation.property.test.js"
  "frontend/tests/progress-indicator.property.test.js"
  "frontend/tests/custom-question-validation.property.test.js"
  "frontend/tests/preview-completeness.property.test.js"
  "frontend/tests/status-timeline.property.test.js"
  "frontend/tests/validation-feedback.property.test.js"
  "frontend/tests/error-message-clarity.property.test.js"
  "frontend/tests/auto-save-retry.property.test.js"
  "frontend/tests/conflict-resolution.property.test.js"
  "frontend/tests/local-storage-sync.property.test.js"
  "frontend/tests/dual-source-checking.property.test.js"
)

# Function to run a test
run_test() {
  local test_file=$1
  local test_name=$(basename "$test_file" .property.test.js)
  
  echo -n "Testing: $test_name ... "
  
  if [ ! -f "$test_file" ]; then
    echo -e "${YELLOW}SKIPPED${NC} (not implemented)"
    ((SKIPPED++))
    return
  fi
  
  # Run the test
  if [[ $test_file == backend/* ]]; then
    cd backend && npm test -- "$test_file" --silent > /dev/null 2>&1
  else
    cd frontend && npm test -- "$test_file" --silent > /dev/null 2>&1
  fi
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
  fi
  
  cd - > /dev/null 2>&1
}

# Run backend tests
echo "═══════════════════════════════════════════════════════════"
echo "Backend Property Tests (12 tests)"
echo "═══════════════════════════════════════════════════════════"
for test in "${BACKEND_TESTS[@]}"; do
  run_test "$test"
done

echo ""

# Run frontend tests
echo "═══════════════════════════════════════════════════════════"
echo "Frontend Property Tests (13 tests)"
echo "═══════════════════════════════════════════════════════════"
for test in "${FRONTEND_TESTS[@]}"; do
  run_test "$test"
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Test Summary"
echo "═══════════════════════════════════════════════════════════"
echo -e "Total Tests:    $TOTAL_TESTS"
echo -e "${GREEN}✓ Passed:       $PASSED${NC}"
echo -e "${RED}✗ Failed:       $FAILED${NC}"
echo -e "${YELLOW}⊘ Skipped:      $SKIPPED${NC}"
echo "═══════════════════════════════════════════════════════════"

# Exit with appropriate code
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Some tests failed!${NC}"
  exit 1
elif [ $SKIPPED -eq $TOTAL_TESTS ]; then
  echo -e "${YELLOW}All tests skipped (not implemented yet)${NC}"
  exit 2
elif [ $PASSED -eq $TOTAL_TESTS ]; then
  echo -e "${GREEN}✅ All property tests passed!${NC}"
  exit 0
else
  echo -e "${YELLOW}Some tests not yet implemented${NC}"
  exit 2
fi
