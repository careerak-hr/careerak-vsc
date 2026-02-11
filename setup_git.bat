@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo Git Setup - Careerak
echo ==========================================
echo.

echo This script will help you configure Git for this project.
echo.

:: Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is NOT installed!
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo ✅ Git is installed
git --version
echo.

:: Configure user.name
echo [1/4] Configuring Git user.name...
for /f "tokens=*" %%i in ('git config user.name 2^>nul') do set current_name=%%i
if defined current_name (
    echo Current name: %current_name%
    set /p "change_name=Change it? (Y/N): "
    if /i "!change_name!"=="Y" (
        set /p "new_name=Enter your name: "
        git config user.name "!new_name!"
        echo ✅ Name updated to: !new_name!
    ) else (
        echo ✅ Keeping current name
    )
) else (
    echo No name configured.
    set /p "new_name=Enter your name: "
    git config user.name "!new_name!"
    echo ✅ Name set to: !new_name!
)

echo.

:: Configure user.email
echo [2/4] Configuring Git user.email...
for /f "tokens=*" %%i in ('git config user.email 2^>nul') do set current_email=%%i
if defined current_email (
    echo Current email: %current_email%
    set /p "change_email=Change it? (Y/N): "
    if /i "!change_email!"=="Y" (
        set /p "new_email=Enter your email: "
        git config user.email "!new_email!"
        echo ✅ Email updated to: !new_email!
    ) else (
        echo ✅ Keeping current email
    )
) else (
    echo No email configured.
    set /p "new_email=Enter your email: "
    git config user.email "!new_email!"
    echo ✅ Email set to: !new_email!
)

echo.

:: Configure default branch
echo [3/4] Configuring default branch...
for /f "tokens=*" %%i in ('git config init.defaultBranch 2^>nul') do set default_branch=%%i
if defined default_branch (
    echo Current default branch: %default_branch%
) else (
    echo Setting default branch to 'main'...
    git config --global init.defaultBranch main
    echo ✅ Default branch set to: main
)

echo.

:: Configure line endings
echo [4/4] Configuring line endings...
for /f "tokens=*" %%i in ('git config core.autocrlf 2^>nul') do set autocrlf=%%i
if defined autocrlf (
    echo Current autocrlf setting: %autocrlf%
) else (
    echo Setting autocrlf to 'true' (recommended for Windows)...
    git config --global core.autocrlf true
    echo ✅ Line endings configured
)

echo.
echo ==========================================
echo Git Configuration Summary
echo ==========================================
echo.

echo User Configuration:
git config user.name
git config user.email

echo.
echo Repository Configuration:
git remote -v

echo.
echo Current Branch:
git branch --show-current

echo.
echo ==========================================
echo ✅ Git Setup Complete!
echo ==========================================
echo.

echo You can now:
echo 1. Add files: git add .
echo 2. Commit: git commit -m "Your message"
echo 3. Push: git push origin main
echo.
echo Or use: test_git_push.bat to test your setup
echo.

pause
