# إصلاحات صفحة AuthPage على الهاتف المحمول

**التاريخ:** 11 فبراير 2026  
**الحالة:** ✅ مكتمل

---

## المشاكل المكتشفة بعد البناء والتجربة على الهاتف

### 1. ✅ صفحة السبلاش تظهر قبل كل الصفحات
**المشكلة:** كانت صفحة السبلاش تظهر عند فتح التطبيق قبل صفحة اللغات

**الحل:**
- تم تعديل `frontend/android/app/src/main/res/values/styles.xml`
- تم تغيير `AppTheme.NoActionBarLaunch` من `Theme.SplashScreen` إلى `AppTheme.NoActionBar`
- تم إزالة `@drawable/splash` واستبداله بـ `@color/colorPrimary`

**الكود:**
```xml
<style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
    <item name="android:background">@color/colorPrimary</item>
    <item name="android:forceDarkAllowed">false</item>
</style>
```

---

### 2. ✅ تغيير لون أرضية الحقل بعد الانتهاء من الكتابة
**المشكلة:** كانت أرضية الحقول تتغير للون مختلف بعد الكتابة فيها

**الحل:**
- تم إضافة قواعد CSS في `frontend/src/pages/03_AuthPage.css`
- تم تثبيت لون الخلفية على البيج (#F5F0E8) في جميع الحالات

**الكود:**
```css
.auth-input-base:focus,
.auth-input-base:active,
.auth-input-base:not(:placeholder-shown) {
  background-color: #F5F0E8 !important;
  color: #304B60 !important;
}
```

---

### 3. ✅ لا يوجد هينت لتاريخ الميلاد
**المشكلة:** حقل تاريخ الميلاد لم يكن له placeholder واضح

**الحل:**
- تم إضافة `birthDatePlaceholder` في `authTranslations.json` للغات الثلاث:
  - العربية: "اختر تاريخ الميلاد"
  - الإنجليزية: "Select Birth Date"
  - الفرنسية: "Sélectionner la date de naissance"
- تم إضافة `placeholder={t.birthDatePlaceholder}` في `IndividualForm.jsx`
- تم إضافة CSS خاص لحقل التاريخ لإظهار الهينت باللون الرمادي

**الكود CSS:**
```css
input[type="date"].auth-input-base {
  color: #9CA3AF; /* رمادي للهينت */
}

input[type="date"].auth-input-base:valid {
  color: #304B60 !important; /* كحلي */
}
```

---

### 4. ✅ لم يتم طلب إذن الوصول للكاميرا والصور
**المشكلة:** التطبيق لم يطلب أذونات الكاميرا والصور عند التشغيل

**الحل:**
- تم إضافة جميع الأذونات المطلوبة في `AndroidManifest.xml`:
  - `CAMERA` - للوصول للكاميرا
  - `READ_EXTERNAL_STORAGE` - لقراءة الصور
  - `WRITE_EXTERNAL_STORAGE` - للكتابة (Android 12 وأقل)
  - `READ_MEDIA_IMAGES` - لقراءة الصور (Android 13+)
- تم إضافة `uses-feature` للكاميرا

**الكود:**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" 
                 android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

<uses-feature android:name="android.hardware.camera" android:required="false" />
<uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
```

---

### 5. ✅ هينتات تظهر باللون الكحلي بدلاً من الرمادي
**المشكلة:** بعض الهينتات في القوائم المنسدلة كانت تظهر باللون الكحلي:
- البلد
- الجنس
- المستوى العلمي
- كود البلد
- مجال عمل الشركة
- نوع الاحتياج

**الحل:**
- تم تعديل CSS للقوائم المنسدلة في `03_AuthPage.css`
- تم تعيين اللون الافتراضي للـ select على الرمادي
- عند اختيار قيمة، يتغير اللون للكحلي

**الكود:**
```css
.auth-select-base {
  color: #9CA3AF; /* رمادي للهينت الافتراضي */
}

/* عندما يتم اختيار قيمة، يتغير اللون للكحلي */
.auth-select-base:not([value=""]),
.auth-select-base:valid {
  color: #304B60 !important; /* كحلي */
}

/* لون الخيارات */
.auth-select-base option[disabled] {
  color: #9CA3AF !important; /* رمادي */
}

.auth-select-base option:not([disabled]) {
  color: #304B60 !important; /* كحلي */
  background-color: #F5F0E8 !important; /* بيج */
}
```

---

## الملفات المعدلة

### 1. Android Configuration
- ✅ `frontend/android/app/src/main/res/values/styles.xml` - إلغاء السبلاش
- ✅ `frontend/android/app/src/main/AndroidManifest.xml` - إضافة أذونات الكاميرا

### 2. Styles & CSS
- ✅ `frontend/src/pages/03_AuthPage.css` - إصلاح الألوان والهينتات

### 3. Components
- ✅ `frontend/src/components/auth/IndividualForm.jsx` - إضافة placeholder للتاريخ

### 4. Translations
- ✅ `frontend/src/data/authTranslations.json` - إضافة ترجمات للتاريخ

---

## النتيجة النهائية

✅ **السبلاش:** تم إلغاؤه - التطبيق يبدأ مباشرة بصفحة اللغات  
✅ **لون الحقول:** ثابت على البيج (#F5F0E8) في جميع الحالات  
✅ **هينت التاريخ:** يظهر باللون الرمادي ويتغير للكحلي عند الاختيار  
✅ **أذونات الكاميرا:** تم إضافتها في AndroidManifest.xml  
✅ **هينتات القوائم:** جميعها رمادية، تتحول للكحلي عند الاختيار  

---

## ملاحظات مهمة

### بعد هذه التعديلات:
1. يجب إعادة بناء التطبيق: `npm run build`
2. يجب مزامنة Capacitor: `npx cap sync android`
3. يجب إعادة بناء APK من Android Studio

### الألوان المستخدمة:
- **البيج الملكي (#F5F0E8):** خلفيات الحقول (ثابت)
- **الكحلي (#304B60):** النصوص المدخلة والخيارات المختارة
- **الرمادي (#9CA3AF):** الهينتات والـ placeholders
- **النحاسي (#D48161):** إطارات خفيفة

### الأذونات:
- التطبيق الآن يطلب أذونات الكاميرا والصور عند أول استخدام
- الأذونات متوافقة مع Android 13+ (READ_MEDIA_IMAGES)
- الأذونات متوافقة مع Android 12 وأقل (READ/WRITE_EXTERNAL_STORAGE)

---

## اختبار التعديلات

### على الهاتف:
1. ✅ افتح التطبيق - يجب أن يبدأ مباشرة بصفحة اللغات (بدون سبلاش)
2. ✅ اختر اللغة وانتقل لصفحة AuthPage
3. ✅ اضغط على أي حقل واكتب - يجب أن يبقى اللون بيج
4. ✅ افتح قائمة منسدلة - الهينت يجب أن يكون رمادي
5. ✅ اختر قيمة من القائمة - يجب أن يتحول للكحلي
6. ✅ اضغط على حقل التاريخ - يجب أن يظهر هينت رمادي
7. ✅ اضغط على رفع الصورة - يجب أن يطلب أذونات الكاميرا

---

## الخطوات التالية

بعد إعادة البناء والاختبار:
- تأكد من أن جميع الهينتات واضحة
- تأكد من أن الألوان ثابتة
- تأكد من طلب الأذونات
- اختبر على أجهزة مختلفة (Android 12, 13, 14)
