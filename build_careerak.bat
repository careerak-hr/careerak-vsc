@echo off
echo [Raghad] Starting the Great Build Process for Careerak...
echo.

echo [1/4] Building Frontend (Web)...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Error in Frontend Build!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/4] Syncing with Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo Error in Capacitor Sync!
    pause
    exit /b %errorlevel%
)

echo.
echo [3/4] Cleaning Android Project...
cd android
call gradlew clean
if %errorlevel% neq 0 (
    echo Error in Gradlew Clean!
    pause
    exit /b %errorlevel%
)

echo.
echo [4/4] Assembling Debug APK...
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo Error in Gradlew Assemble!
    pause
    exit /b %errorlevel%
)

echo.
echo [Raghad] SUCCESS! Your APK is ready at:
echo D:\Careerak\Careerak-vsc\frontend\android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
