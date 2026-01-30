@echo off
setlocal enabledelayedexpansion

echo [Eng.AlaaUddien] Starting the Great Build and Push Process for Careerak...
echo.

:: Check if we're in the right directory
if not exist "frontend" (
    echo Error: frontend directory not found. Please run this script from the project root.
    pause
    exit /b 1
)

:: 1. Git Status Check
echo [1/6] Checking Git status...
git status --porcelain > nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Not a git repository or git not available.
    pause
    exit /b %errorlevel%
)

:: Check for changes
git diff --quiet
set has_changes=%errorlevel%
git diff --cached --quiet
set has_staged=%errorlevel%

if %has_changes% equ 0 if %has_staged% equ 0 (
    echo No changes to commit. Skipping Git operations.
    goto :build_only
)

:: 2. Git Push Process
echo [2/6] Preparing to push changes to GitHub...
git add .

echo Current changes to be committed:
git diff --cached --name-only

echo.
set /p "commit_msg=Enter commit message (or press Enter for default): "
if "!commit_msg!"=="" set "commit_msg=EntryPage fixes: Animation and freeze issues resolved"

echo Committing with message: "!commit_msg!"
git commit -m "!commit_msg!"
if %errorlevel% neq 0 (
    echo Error in Git Commit!
    pause
    exit /b %errorlevel%
)

echo Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo Warning: Git Push failed! Continuing with build process...
    echo You can manually push later with: git push origin main
    echo.
    timeout /t 3 > nul
) else (
    echo Git push successful!
    echo.
)

:build_only
:: 3. Building Frontend
echo [3/6] Building Frontend (Web)...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Error in Frontend Build!
    cd ..
    pause
    exit /b %errorlevel%
)
echo Frontend build successful!
echo.

:: 4. Syncing with Capacitor
echo [4/6] Syncing with Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo Error in Capacitor Sync!
    cd ..
    pause
    exit /b %errorlevel%
)
echo Capacitor sync successful!
echo.

:: 5. Cleaning Android Project
echo [5/6] Cleaning Android Project...
cd android
call gradlew clean
if %errorlevel% neq 0 (
    echo Error in Gradlew Clean!
    cd ..\..
    pause
    exit /b %errorlevel%
)
echo Android clean successful!
echo.

:: 6. Assembling Debug APK
echo [6/6] Assembling Debug APK...
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo Error in Gradlew Assemble!
    cd ..\..
    pause
    exit /b %errorlevel%
)

cd ..\..
echo.
echo ========================================
echo [Eng.AlaaUddien] BUILD SUCCESSFUL!
echo ========================================
echo.
echo APK Location: %CD%\frontend\android\app\build\outputs\apk\debug\careerak.apk
echo.
echo Build completed at: %date% %time%
echo.

:: Check if APK exists
if exist "frontend\android\app\build\outputs\apk\debug\careerak.apk" (
    echo ✅ APK file confirmed to exist
    for %%A in ("frontend\android\app\build\outputs\apk\debug\careerak.apk") do echo APK Size: %%~zA bytes
) else (
    echo ❌ Warning: APK file not found at expected location
)

echo.
echo Press any key to exit...
pause > nul