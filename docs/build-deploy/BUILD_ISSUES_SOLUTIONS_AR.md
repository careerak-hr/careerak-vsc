# حل مشاكل البناء - Careerak

## المشكلة الرئيسية

عملية البناء تتوقف أو تستغرق وقتًا طويلاً جدًا في مرحلة CONFIGURING عند تشغيل Gradle.

## الأسباب المحتملة

1. **تحميل Dependencies لأول مرة**: Gradle يقوم بتحميل جميع المكتبات المطلوبة
2. **مشاكل الاتصال بالإنترنت**: بطء أو انقطاع الاتصال
3. **Gradle Daemon معلق**: عمليات Gradle قديمة تعمل في الخلفية
4. **ذاكرة غير كافية**: إعدادات JVM غير مناسبة
5. **Cache تالف**: ملفات مؤقتة تالفة

## الحلول المطبقة

### 1. تحسين إعدادات Gradle

تم تحديث ملف `frontend/android/gradle.properties`:

```properties
# زيادة الذاكرة المخصصة
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m

# تفعيل البناء المتوازي
org.gradle.parallel=true

# تفعيل التخزين المؤقت
org.gradle.caching=true

# تفعيل Daemon
org.gradle.daemon=true

# تفعيل Configure on Demand
org.gradle.configureondemand=true
```

### 2. ملف بناء محسّن جديد

تم إنشاء `build_careerak_optimized.bat` مع التحسينات التالية:

- إيقاف Gradle daemons قبل البناء
- استخدام `--no-daemon` لتجنب مشاكل الـ daemon
- رسائل واضحة عن التقدم
- معالجة أفضل للأخطاء
- خيار اختياري لـ Git commit/push

### 3. أداة إصلاح مشاكل Gradle

تم إنشاء `fix_gradle_issues.bat` لحل المشاكل الشائعة:

- إيقاف جميع Gradle daemons
- تنظيف Gradle cache
- تحديث Dependencies
- تنظيف شامل
- اختبار اتصال Gradle

## خطوات الحل الموصى بها

### الخطوة 1: تنظيف شامل

```cmd
fix_gradle_issues.bat
# اختر الخيار 4 (Full clean)
```

### الخطوة 2: استخدام ملف البناء المحسّن

```cmd
build_careerak_optimized.bat
```

### إذا استمرت المشكلة

#### الحل 1: بناء يدوي خطوة بخطوة

```cmd
cd frontend
npm run build
npx cap sync android
cd android
gradlew --stop
gradlew clean --no-daemon
gradlew assembleDebug --no-daemon --warning-mode none
```

#### الحل 2: حذف Cache يدويًا

```cmd
cd frontend\android
rmdir /s /q .gradle
rmdir /s /q build
rmdir /s /q app\build
cd ..\..
```

ثم أعد المحاولة.

#### الحل 3: تحديث Gradle Wrapper

```cmd
cd frontend\android
gradlew wrapper --gradle-version=8.7
```

#### الحل 4: فحص الاتصال بالإنترنت

تأكد من:
- الاتصال بالإنترنت مستقر
- لا يوجد Firewall يمنع Gradle
- لا يوجد Proxy يسبب مشاكل

## نصائح مهمة

1. **الصبر في أول بناء**: أول بناء قد يستغرق 10-15 دقيقة لتحميل جميع Dependencies

2. **مراقبة استخدام الذاكرة**: إذا كان جهازك يحتوي على أقل من 8GB RAM، قد تحتاج لتقليل:
   ```properties
   org.gradle.jvmargs=-Xmx1024m
   ```

3. **استخدام VPN**: إذا كان هناك مشاكل في الوصول لـ Maven repositories

4. **إغلاق البرامج الأخرى**: أثناء البناء لتوفير الذاكرة

## ملفات البناء المتوفرة

### build_careerak_optimized.bat (موصى به)
- بناء محسّن مع معالجة أفضل للأخطاء
- خيارات تفاعلية
- إيقاف daemons تلقائيًا

### build_careerak_clean.bat
- بناء نظيف بدون تحذيرات
- يستخدم `--no-configuration-cache` و `--no-daemon`

### build_careerak_final.bat
- بناء مستقر بإعدادات قياسية
- مناسب للإنتاج

## التحقق من نجاح البناء

بعد اكتمال البناء، يجب أن تجد:

```
✅ APK file: frontend\android\app\build\outputs\apk\debug\Careerak-v1.0-debug.apk
✅ Copy in: apk_output\Careerak-v1.0-debug.apk
```

## الأخطاء الشائعة وحلولها

### خطأ: "Could not resolve all dependencies"
**الحل**: 
```cmd
cd frontend\android
gradlew clean --refresh-dependencies
```

### خطأ: "Daemon will be stopped"
**الحل**: استخدم `--no-daemon` flag

### خطأ: "Out of memory"
**الحل**: زيادة الذاكرة في gradle.properties

### خطأ: "Connection timeout"
**الحل**: 
- تحقق من الإنترنت
- استخدم VPN
- أضف في gradle.properties:
  ```properties
  systemProp.http.connectionTimeout=120000
  systemProp.http.socketTimeout=120000
  ```

## الدعم

إذا استمرت المشاكل:

1. احفظ log الخطأ الكامل
2. تحقق من:
   - إصدار Java: `java -version`
   - إصدار Gradle: `cd frontend\android && gradlew --version`
   - إصدار Node: `node --version`
   - إصدار npm: `npm --version`

3. شارك المعلومات للحصول على مساعدة

---

**آخر تحديث**: 2026-02-11  
**المهندس**: Eng.AlaaUddien
