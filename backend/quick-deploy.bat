@echo off
echo ========================================
echo   Careerak Backend - Quick Deploy
echo ========================================
echo.

echo [1/4] Adding all changes...
git add .
echo Done!
echo.

echo [2/4] Creating commit...
git commit -m "fix: CORS configuration and authentication headers"
echo Done!
echo.

echo [3/4] Pushing to GitHub...
git push origin main
echo Done!
echo.

echo [4/4] Deployment Status:
echo ========================================
echo.
echo ✅ Changes pushed to GitHub!
echo.
echo Vercel will auto-deploy in 1-2 minutes.
echo.
echo Check deployment status:
echo https://vercel.com/dashboard
echo.
echo After deployment completes:
echo 1. Refresh http://localhost:3000/admin-dashboard
echo 2. CORS errors should be gone
echo 3. Admin Dashboard should load data
echo.
echo ========================================
pause
