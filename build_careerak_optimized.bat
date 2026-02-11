@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo [Eng.AlaaUddien] Careerak Optimized Build
echo ==========================================
echo.

:: Check if we're in the right directory
if not exist "frontend" (
    echo Error: frontend directory not found. Please run this script from the project root.
    pause
    exit /b 1
)

:: 1. Git Status Check
echo [1/7] Checking Git status...
git status --porcelain > nul 2>&1
if %errorlevel% neq 0 (
    echo Warning: Not a git repository or git not available.
    echo Continuing with build process...
    goto :build_only
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

:: 2. Git Push Process (Optional)
echo [2/7] Git changes detected.
set /p "do_commit=Do you want to commit and push? (Y/N): "
if /i "!do_commit!"=="Y" (
    git add .
    echo Current changes to be committed:
    git diff --cached --name-only
    echo.
    set /p "commit_msg=Enter commit message: "
    if "!commit_msg!"=="" set "commit_msg=Build update"
    
    echo Committing with message: "!commit_msg!"
    git commit -m "!commit_msg!"
    
    echo Pushing to GitHub...
    git push origin main
    if %errorlevel% neq 0 (
        echo Warning: Git Push failed! Continuing with build...
        timeout /t 2 > nul
    ) else (
        echo Git push successful!
    )
    echo.
)

:build_only
:: 3. Building Frontend
echo [3/7] Building Frontend (Web)...
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
echo [4/7] Syncing with Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo Error in Capacitor Sync!
    cd ..
    pause
    exit /b %errorlevel%
)
echo Capacitor sync successful!
echo.

:: 5. Stop any running Gradle daemons
echo [5/7] Stopping Gradle daemons...
cd android
call gradlew --stop
timeout /t 2 > nul
echo.

:: 6. Cleaning Android Project
echo [6/7] Cleaning Android Project...
echo This may take a few minutes on first run...
call gradlew clean --no-daemon
if %errorlevel% neq 0 (
    echo Error in Gradlew Clean!
    cd ..\..
    pause
    exit /b %errorlevel%
)
echo Android clean successful!
echo.

:: 7. Assembling Debug APK
echo [7/7] Assembling Debug APK...
echo Building APK - This may take several minutes...
echo Please be patient, especially on first build...
echo.
call gradlew assembleDebug --no-daemon --warning-mode none
if %errorlevel% neq 0 (
    echo.
    echo ==========================================
    echo BUILD FAILED!
    echo ==========================================
    echo.
    echo Possible solutions:
    echo 1. Check your internet connection
    echo 2. Run: gradlew clean --refresh-dependencies
    echo 3. Delete .gradle folder and try again
    echo 4. Check if Android SDK is properly installed
    echo.
    cd ..\..
    pause
    exit /b %errorlevel%
)

cd ..\..
echo.
echo ==========================================
echo BUILD SUCCESS!
echo ==========================================
echo.
echo Build completed at: %date% %time%
echo.

:: Check if APK exists
set "apk_path=frontend\android\app\build\outputs\apk\debug\Careerak-v1.0-debug.apk"
if exist "%apk_path%" (
    echo ✅ APK file created successfully!
    
    for %%A in ("%apk_path%") do (
        set size=%%~zA
        set /a sizeMB=!size!/1024/1024
        echo 📊 APK Size: !sizeMB! MB
        echo 📅 Created: %%~tA
    )
    
    :: Copy APK to output folder
    if not exist "apk_output" mkdir "apk_output"
    copy "%apk_path%" "apk_output\" >nul 2>&1
    
    if exist "apk_output\Careerak-v1.0-debug.apk" (
        echo.
        echo 📂 APK copied to: %CD%\apk_output\
        echo.
        set /p "open_folder=Open APK folder? (Y/N): "
        if /i "!open_folder!"=="Y" (
            explorer apk_output
        )
    )
) else (
    echo ❌ Warning: APK file not found at expected location
    echo Expected: %CD%\%apk_path%
)

echo.
echo 📱 Build process completed!
echo.
pause
