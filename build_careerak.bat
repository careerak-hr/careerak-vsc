@echo off
setlocal enabledelayedexpansion

echo [Eng.AlaaUddien] Starting the Great Build and Push Process for Careerak...
echo.

:: 1. Git Push Process
echo [1/5] Preparing to push changes to GitHub...
git add .
set /p commit_msg="Enter commit message (or press Enter for default): "
if "!commit_msg!"=="" set commit_msg="Reference Point 09: AI Individual Onboarding, Smart Profile, and New Navigation"

git commit -m "!commit_msg!"
git push origin main
if %errorlevel% neq 0 (
    echo Error in Git Push! Please check your internet or credentials.
    pause
    exit /b %errorlevel%
)
echo.

:: 2. Building Frontend
echo [2/5] Building Frontend (Web)...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Error in Frontend Build!
    pause
    exit /b %errorlevel%
)

:: 3. Syncing with Capacitor
echo.
echo [3/5] Syncing with Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo Error in Capacitor Sync!
    pause
    exit /b %errorlevel%
)

:: 4. Cleaning Android Project
echo.
echo [4/5] Cleaning Android Project...
cd android
call gradlew clean
if %errorlevel% neq 0 (
    echo Error in Gradlew Clean!
    pause
    exit /b %errorlevel%
)

:: 5. Assembling Debug APK
echo.
echo [5/5] Assembling Debug APK...
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo Error in Gradlew Assemble!
    pause
    exit /b %errorlevel%
)

echo.
echo [Eng.AlaaUddien] SUCCESS!
echo - Code pushed to GitHub.
echo - APK is ready at: D:\Careerak\Careerak-vsc\frontend\android\app\build\outputs\apk\debug\careerak.apk
echo.
pause
