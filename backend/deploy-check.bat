@echo off
echo ========================================
echo   Careerak Backend - Deploy Check
echo ========================================
echo.

echo [1/5] Checking Git status...
git status
echo.

echo [2/5] Checking for uncommitted changes...
git diff --stat
echo.

echo [3/5] Checking last commit...
git log -1 --oneline
echo.

echo [4/5] Checking remote status...
git fetch origin
git status
echo.

echo [5/5] Summary:
echo ========================================
echo.
echo If you see uncommitted changes above, run:
echo   git add .
echo   git commit -m "fix: CORS and authentication"
echo   git push origin main
echo.
echo If everything is committed, Vercel should auto-deploy.
echo Check: https://vercel.com/dashboard
echo.
echo ========================================
pause
