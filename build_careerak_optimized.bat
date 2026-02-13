@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo [Eng.AlaaUddien] Careerak Complete Build
echo ==========================================
echo.

:: Check if we're in the right directory
if not exist "frontend" (
    echo Error: frontend directory not found. Please run this script from the project root.
    pause
    exit /b 1
)

:: 1. Git Configuration Check
echo [1/9] Checking Git configuration...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Warning: Git is not installed. Skipping Git operations.
    goto :build_only
)

for /f "tokens=*" %%i in ('git config user.name 2^>nul') do set git_name=%%i
for /f "tokens=*" %%i in ('git config user.email 2^>nul') do set git_email=%%i

if not defined git_name (
    echo Git user.name not configured. Setting default...
    git config user.name "Eng.AlaaUddien"
    set git_name=Eng.AlaaUddien
)

if not defined git_email (
    echo Git user.email not configured. Setting default...
    git config user.email "eng.alaa@careerak.com"
    set git_email=eng.alaa@careerak.com
)

echo Git user: %git_name% ^<%git_email%^>
echo.

:: 2. Git Status Check
echo [2/9] Checking Git status...
git status --porcelain > nul 2>&1
if %errorlevel% neq 0 (
    echo Warning: Not a git repository. Skipping Git operations.
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

:: Show changes
echo Changes detected:
git status --short
echo.

:: 3. Git Commit Process
echo [3/9] Git Commit Process...
set /p "do_commit=Do you want to commit changes? (Y/N): "
if /i "!do_commit!"=="Y" (
    echo.
    echo Adding all changes to staging...
    git add .
    
    echo.
    echo Files to be committed:
    git diff --cached --name-only
    echo.
    
    set /p "commit_msg=Enter commit message (or press Enter for default): "
    if "!commit_msg!"=="" set "commit_msg=Build update: %date% %time%"
    
    echo Committing with message: "!commit_msg!"
    git commit -m "!commit_msg!"
    
    if !errorlevel! neq 0 (
        echo Warning: Git commit failed! Continuing with build...
        timeout /t 2 > nul
    ) else (
        echo Commit successful!
        
        :: 4. Git Push Process
        echo.
        echo [4/9] Git Push Process...
        for /f "tokens=*" %%i in ('git branch --show-current') do set current_branch=%%i
        echo Current branch: !current_branch!
        
        set /p "do_push=Push to GitHub? (Y/N): "
        if /i "!do_push!"=="Y" (
            echo.
            echo Testing connection to GitHub...
            git ls-remote --heads origin >nul 2>&1
            if !errorlevel! neq 0 (
                echo Warning: Cannot connect to GitHub! Skipping push...
                timeout /t 2 > nul
            ) else (
                echo Pushing to origin/!current_branch!...
                git push origin !current_branch!
                if !errorlevel! neq 0 (
                    echo Warning: Git push failed! Continuing with build...
                    timeout /t 2 > nul
                ) else (
                    echo Push successful!
                )
            )
        ) else (
            echo Push skipped. You can push later with: git push origin !current_branch!
        )
    )
    echo.
) else (
    echo Git commit skipped.
    echo.
)

:build_only
:: 5. Building Frontend
echo [5/9] Building Frontend (Web)...
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

:: 6. Syncing with Capacitor
echo [6/9] Syncing with Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo Error in Capacitor Sync!
    cd ..
    pause
    exit /b %errorlevel%
)
echo Capacitor sync successful!
echo.

:: 7. Stop any running Gradle daemons
echo [7/9] Stopping Gradle daemons...
cd android
call gradlew --stop
timeout /t 2 > nul
echo.

:: 8. Cleaning Android Project
echo [8/9] Cleaning Android Project...
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

:: 9. Assembling Debug APK
echo [9/9] Assembling Debug APK...
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
