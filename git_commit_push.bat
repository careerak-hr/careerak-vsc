@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo Git Commit and Push - Careerak
echo ==========================================
echo.

:: Check Git configuration
echo [1/7] Checking Git configuration...
for /f "tokens=*" %%i in ('git config user.name 2^>nul') do set git_name=%%i
for /f "tokens=*" %%i in ('git config user.email 2^>nul') do set git_email=%%i

if not defined git_name (
    echo ❌ Git user.name not configured!
    echo Run: setup_git.bat
    pause
    exit /b 1
)

if not defined git_email (
    echo ❌ Git user.email not configured!
    echo Run: setup_git.bat
    pause
    exit /b 1
)

echo ✅ Git user: %git_name% ^<%git_email%^>
echo.

:: Check for changes
echo [2/7] Checking for changes...
git status --short
git diff --quiet
set has_unstaged=%errorlevel%
git diff --cached --quiet
set has_staged=%errorlevel%

if %has_unstaged% equ 0 if %has_staged% equ 0 (
    echo.
    echo ℹ️  No changes to commit.
    echo    Working directory is clean.
    pause
    exit /b 0
)

echo.
echo Changes detected!
echo.

:: Show detailed status
echo [3/7] Detailed status...
echo.
echo Modified files:
git status --short | findstr /R "^.M"
echo.
echo New files:
git status --short | findstr /R "^??"
echo.
echo Staged files:
git status --short | findstr /R "^M"
echo.

:: Add files
echo [4/7] Adding files to staging...
set /p "add_all=Add all changes? (Y/N): "
if /i "!add_all!"=="Y" (
    git add .
    echo ✅ All changes added to staging
) else (
    echo.
    echo Please add files manually:
    echo   git add ^<file^>
    echo.
    echo Then run this script again.
    pause
    exit /b 0
)

echo.

:: Get commit message
echo [5/7] Creating commit...
echo.
echo Enter commit message (or press Enter for default):
set /p "commit_msg="

if "!commit_msg!"=="" (
    :: Generate default message based on changes
    set "commit_msg=Update: Build system improvements and documentation"
)

echo.
echo Commit message: !commit_msg!
echo.

git commit -m "!commit_msg!"
if %errorlevel% neq 0 (
    echo ❌ Commit failed!
    pause
    exit /b 1
)

echo ✅ Commit successful!
echo.

:: Check remote status
echo [6/7] Checking remote status...
for /f "tokens=*" %%i in ('git branch --show-current') do set current_branch=%%i
echo Current branch: %current_branch%

git fetch origin %current_branch% >nul 2>&1
for /f %%i in ('git rev-list --count HEAD..origin/%current_branch% 2^>nul') do set behind=%%i
for /f %%i in ('git rev-list --count origin/%current_branch%..HEAD 2^>nul') do set ahead=%%i

if not defined behind set behind=0
if not defined ahead set ahead=0

echo Commits ahead: %ahead%
echo Commits behind: %behind%
echo.

if %behind% gtr 0 (
    echo ⚠️  Your branch is %behind% commit(s) behind origin
    echo.
    set /p "do_pull=Pull changes first? (Y/N): "
    if /i "!do_pull!"=="Y" (
        echo.
        echo Pulling changes...
        git pull origin %current_branch%
        if !errorlevel! neq 0 (
            echo ❌ Pull failed! Please resolve conflicts.
            pause
            exit /b 1
        )
        echo ✅ Pull successful!
        echo.
    )
)

:: Push to remote
echo [7/7] Pushing to GitHub...
echo.
set /p "do_push=Push to origin/%current_branch%? (Y/N): "
if /i "!do_push!"=="Y" (
    echo.
    echo Pushing...
    git push origin %current_branch%
    
    if !errorlevel! equ 0 (
        echo.
        echo ==========================================
        echo ✅ PUSH SUCCESSFUL!
        echo ==========================================
        echo.
        echo Your changes have been pushed to GitHub.
        echo Repository: https://github.com/careerak-hr/careerak-vsc
        echo Branch: %current_branch%
        echo.
    ) else (
        echo.
        echo ==========================================
        echo ❌ PUSH FAILED!
        echo ==========================================
        echo.
        echo Possible issues:
        echo 1. Authentication required
        echo    - You may need to enter credentials
        echo    - Or configure SSH keys
        echo    - Or use Personal Access Token
        echo.
        echo 2. No permission to push
        echo    - Check repository permissions
        echo.
        echo 3. Branch protection rules
        echo    - Check GitHub branch settings
        echo.
        echo 4. Network issues
        echo    - Check internet connection
        echo.
        echo Try:
        echo   git push origin %current_branch% --verbose
        echo.
    )
) else (
    echo.
    echo Push cancelled.
    echo Your commit is saved locally.
    echo You can push later with: git push origin %current_branch%
)

echo.
pause
