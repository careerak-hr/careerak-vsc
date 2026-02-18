@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   🔍 فحص حالة Backend
echo ========================================
echo.

REM التحقق من تشغيل Backend
echo 🔄 جاري فحص Backend...
curl -s http://localhost:5000/health >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ Backend يعمل بنجاح!
    echo.
    echo 📊 معلومات السيرفر:
    curl -s http://localhost:5000/health
    echo.
) else (
    echo ❌ Backend لا يعمل!
    echo.
    echo 💡 لتشغيل Backend:
    echo    1. start-backend.bat (مع PM2)
    echo    2. start-backend-simple.bat (بدون PM2)
    echo    3. npm start (تشغيل عادي)
    echo.
)

echo.
pause
