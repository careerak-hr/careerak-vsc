@echo off
echo ==========================================
echo Git Push Test - Careerak
echo ==========================================
echo.

echo [1/6] Checking Git configuration...
echo.

:: Check user.name
for /f "tokens=*" %%i in ('git config user.name 2^>nul') do set git_name=%%i
if defined git_name (
    echo ✅ Git user.name: %git_name%
) else (
    echo ⚠️  Git user.name NOT set!
    echo.
    set /p "new_name=Enter your name for Git commits: "
    git config user.name "!new_name!"
    echo ✅ Git user.name set to: !new_name!
)

:: Check user.email
for /f "tokens=*" %%i in ('git config user.email 2^>nul') do set git_email=%%i
if defined git_email (
    echo ✅ Git user.email: %git_email%
) else (
    echo ⚠️  Git user.email NOT set!
    echo.
    set /p "new_email=Enter your email for Git commits: "
    git config user.email "!new_email!"
    echo ✅ Git user.email set to: !new_email!
)

echo.
echo [2/6] Checking remote repository...
git remote -v
if %errorlevel% neq 0 (
    echo ❌ No remote repository configured!
    pause
    exit /b 1
)

echo.
echo [3/6] Checking connection to GitHub...
git ls-remote --heads origin >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Cannot connect to GitHub!
    echo.
    echo Possible issues:
    echo - No internet connection
    echo - GitHub is down
    echo - Authentication required
    echo - Repository doesn't exist
    pause
    exit /b 1
) else (
    echo ✅ Connection to GitHub successful!
)

echo.
echo [4/6] Checking current branch...
for /f "tokens=*" %%i in ('git branch --show-current') do set current_branch=%%i
echo Current branch: %current_branch%

echo.
echo [5/6] Checking Git status...
git status --short
if %errorlevel% neq 0 (
    echo ❌ Error checking Git status!
    pause
    exit /b 1
)

echo.
echo [6/6] Checking if push is needed...
git fetch origin %current_branch% >nul 2>&1
for /f %%i in ('git rev-list --count HEAD..origin/%current_branch% 2^>nul') do set behind=%%i
for /f %%i in ('git rev-list --count origin/%current_branch%..HEAD 2^>nul') do set ahead=%%i

if not defined behind set behind=0
if not defined ahead set ahead=0

echo.
echo ==========================================
echo Git Status Summary
echo ==========================================
echo.
echo Current branch: %current_branch%
echo Commits ahead of origin: %ahead%
echo Commits behind origin: %behind%
echo.

if %ahead% gtr 0 (
    echo ✅ You have %ahead% commit(s) ready to push
) else (
    echo ℹ️  No commits to push (already up to date)
)

if %behind% gtr 0 (
    echo ⚠️  Your branch is %behind% commit(s) behind origin
    echo    Run: git pull origin %current_branch%
)

echo.
echo ==========================================
echo Test Push (Dry Run)
echo ==========================================
echo.
echo Testing push without actually pushing...
git push --dry-run origin %current_branch% 2>&1
set push_test=%errorlevel%

echo.
if %push_test% equ 0 (
    echo ✅ Push test SUCCESSFUL!
    echo    You can safely push your changes.
    echo.
    set /p "do_push=Do you want to push now? (Y/N): "
    if /i "!do_push!"=="Y" (
        echo.
        echo Pushing to GitHub...
        git push origin %current_branch%
        if !errorlevel! equ 0 (
            echo.
            echo ✅ Push SUCCESSFUL!
        ) else (
            echo.
            echo ❌ Push FAILED!
            echo Check the error message above.
        )
    )
) else (
    echo ❌ Push test FAILED!
    echo.
    echo Possible issues:
    echo - Authentication required
    echo - No permission to push
    echo - Branch protection rules
    echo - Network issues
)

echo.
pause
