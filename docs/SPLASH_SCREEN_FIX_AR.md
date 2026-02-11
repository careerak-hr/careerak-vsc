# إصلاح شاشة البداية الزرقاء - Splash Screen Fix

## المشكلة

عند فتح التطبيق، تظهر شاشة زرقاء لبضع ثوانٍ قبل ظهور المحتوى الفعلي.

### السبب

التطبيق يستخدم Capacitor الذي يأتي مع ألوان افتراضية:
- `colorPrimary`: `#3F51B5` (أزرق)
- `colorPrimaryDark`: `#303F9F` (أزرق داكن)
- `colorAccent`: `#FF4081` (وردي)

وكان ملف `styles.xml` يستخدم `@color/colorPrimary` كخلفية لشاشة البداية، مما أدى إلى ظهور الشاشة الزرقاء.

## الحل المطبق

### 1. إنشاء ملف الألوان المخصص

تم إنشاء ملف `frontend/android/app/src/main/res/values/colors.xml` مع ألوان Careerak:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Careerak Brand Colors -->
    
    <!-- Primary Color - الكحلي الوقور -->
    <color name="colorPrimary">#304B60</color>
    <color name="colorPrimaryDark">#1A2C3F</color>
    
    <!-- Accent Color - النحاسي الفخم -->
    <color name="colorAccent">#D48161</color>
    
    <!-- Secondary Color - البيج الملكي -->
    <color name="colorSecondary">#E3DAD1</color>
    <color name="colorSecondaryLight">#F1EAE4</color>
    
    <!-- Background Colors -->
    <color name="backgroundColor">#E3DAD1</color>
    <color name="splashBackground">#E3DAD1</color>
    
    <!-- Status Bar -->
    <color name="statusBarColor">#304B60</color>
</resources>
```

### 2. تحديث ملف Styles

تم تحديث `frontend/android/app/src/main/res/values/styles.xml`:

**قبل**:
```xml
<style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
    <item name="android:background">@color/colorPrimary</item>
    <item name="android:forceDarkAllowed">false</item>
</style>
```

**بعد**:
```xml
<style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
    <item name="android:background">@color/splashBackground</item>
    <item name="android:windowBackground">@color/splashBackground</item>
    <item name="android:forceDarkAllowed">false</item>
</style>
```

### 3. تحديث Night Mode

تم تحديث `frontend/android/app/src/main/res/values-night/styles.xml` بنفس الطريقة.

## النتيجة

الآن عند فتح التطبيق:
- ✅ تظهر شاشة بيج (#E3DAD1) بدلاً من الأزرق
- ✅ تتناسق مع ألوان التطبيق
- ✅ تجربة مستخدم أفضل

## ألوان Careerak الرسمية

### Primary (الكحلي الوقور)
- Default: `#304B60`
- Light: `#4A6A88`
- Dark: `#1A2C3F`

### Secondary (البيج الملكي)
- Default: `#E3DAD1`
- Light: `#F1EAE4`
- Dark: `#D2C9C0`

### Accent (النحاسي الفخم)
- Default: `#D48161`
- Light: `#E5A88C`
- Dark: `#B86B49`

## اختبار التغييرات

### 1. بناء التطبيق

```cmd
cd frontend
npm run build
npx cap sync android
cd android
gradlew assembleDebug
```

أو استخدم:
```cmd
build_careerak_optimized.bat
```

### 2. تثبيت التطبيق

```cmd
adb install -r app/build/outputs/apk/debug/Careerak-v1.0-debug.apk
```

### 3. اختبار

- افتح التطبيق
- يجب أن تظهر شاشة بيج بدلاً من الأزرق
- تحقق من أن الانتقال سلس

## ملاحظات مهمة

### 1. Capacitor Sync

بعد أي تغيير في ملفات Android، يجب تشغيل:
```cmd
npx cap sync android
```

### 2. Clean Build

إذا لم تظهر التغييرات، قم بـ clean build:
```cmd
cd frontend/android
gradlew clean
gradlew assembleDebug
```

### 3. تجاوز الألوان الافتراضية

ملف `colors.xml` في مجلد التطبيق يتجاوز ألوان Capacitor الافتراضية.
الأولوية:
1. `app/src/main/res/values/colors.xml` (أعلى أولوية)
2. `capacitor/src/main/res/values/colors.xml` (افتراضي)

## المشاكل المحتملة

### المشكلة: لا تزال الشاشة زرقاء

**الحل**:
1. تأكد من وجود ملف `colors.xml`
2. قم بـ clean build
3. تأكد من sync مع Capacitor
4. أعد تثبيت التطبيق

### المشكلة: الشاشة بيضاء

**الحل**:
تحقق من أن اللون صحيح في `colors.xml`:
```xml
<color name="splashBackground">#E3DAD1</color>
```

### المشكلة: الشاشة تظهر بلون مختلف في Dark Mode

**الحل**:
تأكد من تحديث `values-night/styles.xml` أيضًا.

## الملفات المعدلة

1. ✅ `frontend/android/app/src/main/res/values/colors.xml` (جديد)
2. ✅ `frontend/android/app/src/main/res/values/styles.xml` (معدل)
3. ✅ `frontend/android/app/src/main/res/values-night/styles.xml` (معدل)

## المراجع

- [Android Color Resources](https://developer.android.com/guide/topics/resources/more-resources#Color)
- [Capacitor Android Configuration](https://capacitorjs.com/docs/android/configuration)
- [Android Splash Screen](https://developer.android.com/develop/ui/views/launch/splash-screen)

---

**التاريخ**: 2026-02-11  
**المهندس**: Eng.AlaaUddien  
**الحالة**: ✅ تم الإصلاح
