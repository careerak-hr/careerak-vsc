@echo off
echo ==========================================
echo Testing Build Environment - Careerak
echo ==========================================
echo.

echo Checking required tools...
echo.

:: Check Node.js
echo [1/5] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js NOT found!
    echo Please install Node.js from: https://nodejs.org/
) else (
    for /f "tokens=*" %%i in ('node --version') do set node_version=%%i
    echo ✅ Node.js: !node_version!
)
echo.

:: Check npm
echo [2/5] Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm NOT found!
) else (
    for /f "tokens=*" %%i in ('npm --version') do set npm_version=%%i
    echo ✅ npm: !npm_version!
)
echo.

:: Check Java
echo [3/5] Checking Java...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Java NOT found!
    echo Please install Java JDK 21
) else (
    echo ✅ Java installed
    java -version 2>&1 | findstr /i "version"
)
echo.

:: Check Gradle
echo [4/5] Checking Gradle...
if exist "frontend\android\gradlew.bat" (
    echo ✅ Gradle wrapper found
    cd frontend\android
    call gradlew --version 2>&1 | findstr /i "Gradle"
    cd ..\..
) else (
    echo ❌ Gradle wrapper NOT found!
)
echo.

:: Check project structure
echo [5/5] Checking project structure...
set all_ok=1

if exist "frontend" (
    echo ✅ frontend folder exists
) else (
    echo ❌ frontend folder NOT found!
    set all_ok=0
)

if exist "frontend\package.json" (
    echo ✅ frontend\package.json exists
) else (
    echo ❌ frontend\package.json NOT found!
    set all_ok=0
)

if exist "frontend\android" (
    echo ✅ frontend\android folder exists
) else (
    echo ❌ frontend\android folder NOT found!
    set all_ok=0
)

if exist "frontend\node_modules" (
    echo ✅ frontend\node_modules exists
) else (
    echo ⚠️  frontend\node_modules NOT found!
    echo    Run: cd frontend && npm install
)

echo.
echo ==========================================
if %all_ok%==1 (
    echo ✅ Environment check PASSED!
    echo.
    echo You can now run: build_careerak_optimized.bat
) else (
    echo ❌ Environment check FAILED!
    echo.
    echo Please fix the issues above before building.
)
echo ==========================================
echo.
pause
