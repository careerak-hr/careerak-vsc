@echo off
echo [Git Fix Tool] Fixing common Git issues...
echo.

:: 1. Check Git status
echo [1/4] Checking Git status...
git status
echo.

:: 2. Fix line ending warnings
echo [2/4] Fixing line ending issues...
git config core.autocrlf true
git config core.safecrlf false
echo Line ending configuration updated.
echo.

:: 3. Add and commit changes safely
echo [3/4] Adding and committing changes...
git add .

set /p "commit_msg=Enter commit message: "
if "!commit_msg!"=="" set "commit_msg=Fix: EntryPage animation and freeze issues resolved"

git commit -m "%commit_msg%"
if %errorlevel% neq 0 (
    echo No changes to commit or commit failed.
) else (
    echo Commit successful!
)
echo.

:: 4. Try to push
echo [4/4] Attempting to push to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo Push failed. Possible solutions:
    echo 1. Check your internet connection
    echo 2. Verify GitHub credentials
    echo 3. Try: git push --set-upstream origin main
    echo 4. Check if repository URL is correct: git remote -v
    echo.
    echo Current remote URLs:
    git remote -v
) else (
    echo Push successful!
)

echo.
pause