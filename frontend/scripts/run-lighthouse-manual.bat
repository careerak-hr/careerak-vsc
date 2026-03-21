@echo off
echo ========================================
echo Lighthouse Audit - Manual Process
echo ========================================
echo.
echo Step 1: Starting local server on port 3001...
echo.

start /B npx serve build -p 3001

timeout /t 5 /nobreak > nul

echo Server started. You can now run Lighthouse audits.
echo.
echo ========================================
echo Manual Audit Instructions:
echo ========================================
echo.
echo 1. Open Chrome and navigate to: http://localhost:3001
echo 2. Press F12 to open DevTools
echo 3. Click on "Lighthouse" tab
echo 4. Select all categories (Performance, Accessibility, SEO, Best Practices)
echo 5. Click "Analyze page load"
echo 6. Save the report when complete
echo.
echo Pages to audit:
echo   - Home: http://localhost:3001/
echo   - Entry: http://localhost:3001/entry
echo   - Language: http://localhost:3001/language
echo   - Login: http://localhost:3001/login
echo   - Registration: http://localhost:3001/auth
echo.
echo Press any key to stop the server when done...
pause > nul

taskkill /F /IM node.exe /FI "WINDOWTITLE eq npx*" 2>nul
echo.
echo Server stopped.
echo.
pause
