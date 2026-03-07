@echo off
REM Property-Based Tests Runner for Apply Page Enhancements
REM This script runs all 25 property tests with 100+ iterations

echo ╔════════════════════════════════════════════════════════════╗
echo ║   Apply Page Enhancements - Property Tests Runner         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

setlocal enabledelayedexpansion

REM Counters
set TOTAL_TESTS=25
set PASSED=0
set FAILED=0
set SKIPPED=0

REM Backend tests
set BACKEND_TESTS=auto-fill-completeness draft-round-trip draft-deletion file-validation file-removal withdrawal-restrictions withdrawal-completeness status-notifications custom-answer-persistence backend-persistence user-modifications-persistence empty-profile-handling

REM Frontend tests
set FRONTEND_TESTS=navigation-preservation step-validation backward-navigation progress-indicator custom-question-validation preview-completeness status-timeline validation-feedback error-message-clarity auto-save-retry conflict-resolution local-storage-sync dual-source-checking

echo ═══════════════════════════════════════════════════════════
echo Backend Property Tests (12 tests)
echo ═══════════════════════════════════════════════════════════

for %%t in (%BACKEND_TESTS%) do (
  echo Testing: %%t ...
  if exist "backend\tests\%%t.property.test.js" (
    cd backend
    call npm test -- "tests\%%t.property.test.js" --silent >nul 2>&1
    if !errorlevel! equ 0 (
      echo ✓ PASSED
      set /a PASSED+=1
    ) else (
      echo ✗ FAILED
      set /a FAILED+=1
    )
    cd ..
  ) else (
    echo ⊘ SKIPPED (not implemented)
    set /a SKIPPED+=1
  )
)

echo.
echo ═══════════════════════════════════════════════════════════
echo Frontend Property Tests (13 tests)
echo ═══════════════════════════════════════════════════════════

for %%t in (%FRONTEND_TESTS%) do (
  echo Testing: %%t ...
  if exist "frontend\tests\%%t.property.test.js" (
    cd frontend
    call npm test -- "tests\%%t.property.test.js" --silent >nul 2>&1
    if !errorlevel! equ 0 (
      echo ✓ PASSED
      set /a PASSED+=1
    ) else (
      echo ✗ FAILED
      set /a FAILED+=1
    )
    cd ..
  ) else (
    echo ⊘ SKIPPED (not implemented)
    set /a SKIPPED+=1
  )
)

echo.
echo ═══════════════════════════════════════════════════════════
echo Test Summary
echo ═══════════════════════════════════════════════════════════
echo Total Tests:    %TOTAL_TESTS%
echo ✓ Passed:       %PASSED%
echo ✗ Failed:       %FAILED%
echo ⊘ Skipped:      %SKIPPED%
echo ═══════════════════════════════════════════════════════════

if %FAILED% gtr 0 (
  echo Some tests failed!
  exit /b 1
) else if %SKIPPED% equ %TOTAL_TESTS% (
  echo All tests skipped (not implemented yet)
  exit /b 2
) else if %PASSED% equ %TOTAL_TESTS% (
  echo ✅ All property tests passed!
  exit /b 0
) else (
  echo Some tests not yet implemented
  exit /b 2
)
