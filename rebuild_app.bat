@echo off
echo ========================================
echo Rebuilding Careerak App
echo ========================================
echo.

cd frontend

echo [1/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo Error: npm install failed
    pause
    exit /b 1
)

echo.
echo [2/3] Building the app...
call npm run build
if errorlevel 1 (
    echo Error: Build failed
    pause
    exit /b 1
)

echo.
echo [3/3] Syncing with Capacitor...
call npx cap sync
if errorlevel 1 (
    echo Error: Capacitor sync failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo You can now run the app:
echo   - Android: npx cap open android
echo   - iOS: npx cap open ios
echo.
pause
