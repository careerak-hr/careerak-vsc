@echo off
echo ==========================================
echo Gradle Issues Fix Script
echo ==========================================
echo.
echo This script will help fix common Gradle build issues
echo.

if not exist "frontend\android" (
    echo Error: frontend\android directory not found!
    pause
    exit /b 1
)

echo Select an option:
echo.
echo 1. Stop all Gradle daemons
echo 2. Clean Gradle cache
echo 3. Refresh dependencies
echo 4. Full clean (stop daemons + clean cache + refresh)
echo 5. Test Gradle connection
echo 6. Exit
echo.

set /p "choice=Enter your choice (1-6): "

cd frontend\android

if "%choice%"=="1" goto stop_daemons
if "%choice%"=="2" goto clean_cache
if "%choice%"=="3" goto refresh_deps
if "%choice%"=="4" goto full_clean
if "%choice%"=="5" goto test_gradle
if "%choice%"=="6" goto end
goto invalid_choice

:stop_daemons
echo.
echo Stopping all Gradle daemons...
call gradlew --stop
echo Done!
goto end

:clean_cache
echo.
echo Cleaning Gradle cache...
if exist ".gradle" (
    echo Deleting .gradle folder...
    rmdir /s /q .gradle
    echo Done!
) else (
    echo .gradle folder not found
)
goto end

:refresh_deps
echo.
echo Refreshing dependencies...
call gradlew clean --refresh-dependencies
echo Done!
goto end

:full_clean
echo.
echo Performing full clean...
echo.
echo Step 1: Stopping Gradle daemons...
call gradlew --stop
timeout /t 2 > nul
echo.
echo Step 2: Cleaning Gradle cache...
if exist ".gradle" (
    rmdir /s /q .gradle
    echo .gradle folder deleted
)
if exist "build" (
    rmdir /s /q build
    echo build folder deleted
)
if exist "app\build" (
    rmdir /s /q app\build
    echo app\build folder deleted
)
echo.
echo Step 3: Refreshing dependencies...
call gradlew clean --refresh-dependencies
echo.
echo Full clean completed!
goto end

:test_gradle
echo.
echo Testing Gradle connection...
call gradlew --version
echo.
echo If you see version information above, Gradle is working correctly.
goto end

:invalid_choice
echo.
echo Invalid choice! Please run the script again.
goto end

:end
cd ..\..
echo.
pause
