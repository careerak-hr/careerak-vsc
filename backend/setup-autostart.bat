@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   ⚙️ إعداد بدء التشغيل التلقائي
echo ========================================
echo.

REM التحقق من صلاحيات Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ يجب تشغيل هذا الملف كـ Administrator!
    echo.
    echo 💡 كيفية التشغيل:
    echo    1. انقر بزر الماوس الأيمن على الملف
    echo    2. اختر "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo ✅ صلاحيات Administrator متوفرة
echo.

REM الانتقال إلى مجلد Backend
cd /d "%~dp0"

REM التحقق من PM2
where pm2 >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ PM2 غير مثبت!
    echo.
    echo 📦 جاري التثبيت...
    call npm install -g pm2
    if %errorlevel% neq 0 (
        echo ❌ فشل التثبيت
        pause
        exit /b 1
    )
    echo ✅ تم تثبيت PM2
    echo.
)

REM التحقق من تشغيل Backend
pm2 list | findstr "careerak-backend" >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ Backend غير مشغل!
    echo.
    echo 🚀 جاري تشغيل Backend...
    pm2 start ecosystem.config.js --name careerak-backend
    if %errorlevel% neq 0 (
        echo ❌ فشل تشغيل Backend
        pause
        exit /b 1
    )
    echo ✅ تم تشغيل Backend
    echo.
)

REM حفظ التكوين
echo 💾 حفظ التكوين...
pm2 save
echo.

REM إعداد بدء التشغيل التلقائي
echo 🔧 إعداد بدء التشغيل التلقائي مع Windows...
pm2 startup windows
echo.

REM تأكيد
echo ========================================
echo   ✅ تم الإعداد بنجاح!
echo ========================================
echo.
echo 📋 ما تم:
echo   ✅ PM2 مثبت
echo   ✅ Backend يعمل
echo   ✅ التكوين محفوظ
echo   ✅ بدء التشغيل التلقائي مفعّل
echo.
echo 🎉 الآن Backend سيبدأ تلقائياً مع Windows!
echo.
echo 📊 للتحقق:
echo   pm2 status
echo   pm2 logs careerak-backend
echo.

pm2 status
echo.

pause
