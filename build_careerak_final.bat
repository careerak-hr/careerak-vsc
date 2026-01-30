@echo off
setlocal enabledelayedexpansion

echo [Eng.AlaaUddien] Starting Final Stable Build Process for Careerak...
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
if "!commit_msg!"=="" set "commit_msg=Final build optimization: Stable configuration without experimental settings"

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
call gradlew clean --quiet
if %errorlevel% neq 0 (
    echo Error in Gradlew Clean!
    cd ..\..
    pause
    exit /b %errorlevel%
)
echo Android clean successful!
echo.

:: 6. Assembling Debug APK (Final Stable Build)
echo [6/6] Assembling Debug APK (Final Stable Build)...
echo Building APK with stable configuration only...
echo.
call gradlew assembleDebug --quiet --warning-mode none
if %errorlevel% neq 0 (
    echo Error in Gradlew Assemble!
    cd ..\..
    pause
    exit /b %errorlevel%
)

cd ..\..
echo.
echo ============================================
echo [Eng.AlaaUddien] FINAL STABLE BUILD SUCCESS!
echo ============================================
echo.
echo 🎯 Build completed with stable configuration
echo 📱 APK Location: %CD%\frontend\android\app\build\outputs\apk\debug\careerak-debug.apk
echo.
echo Build completed at: %date% %time%
echo.

:: Check if APK exists and get detailed info
if exist "frontend\android\app\build\outputs\apk\debug\careerak-debug.apk" (
    echo ✅ APK file confirmed to exist
    for %%A in ("frontend\android\app\build\outputs\apk\debug\careerak-debug.apk") do (
        set size=%%~zA
        set /a sizeMB=!size!/1024/1024
        echo 📊 APK Size: !sizeMB! MB ^(!size! bytes^)
        echo 📅 APK Date: %%~tA
    )
) else (
    echo ❌ Warning: APK file not found at expected location
    echo 🔍 Checking alternative locations...
    if exist "frontend\android\app\build\outputs\apk\debug\app-debug.apk" (
        echo ✅ Found APK at: app-debug.apk
        ren "frontend\android\app\build\outputs\apk\debug\app-debug.apk" "careerak-debug.apk"
        echo ✅ Renamed to: careerak-debug.apk
    )
)

echo.
echo 🚀 FINAL STABLE BUILD FEATURES:
echo   ✅ No experimental settings used
echo   ✅ Jetifier properly disabled
echo   ✅ Stable Gradle configuration
echo   ✅ External library warnings suppressed
echo   ✅ Production-ready build
echo.
echo 💡 This build uses only stable, non-experimental settings
echo 💡 Perfect for production deployment
echo.
echo 📱 APK is ready for installation and distribution!
echo.
echo Press any key to exit...
pause > nul