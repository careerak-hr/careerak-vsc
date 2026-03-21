# دليل إعداد LinkedIn API - خطوة بخطوة 🚀

## 📋 نظرة عامة
هذا الدليل يشرح كيفية الحصول على LinkedIn Client ID و Secret وإضافتهم للمشروع.

**الوقت المطلوب**: 10 دقائق

---

## 🔑 الخطوة 1: إنشاء تطبيق LinkedIn

### 1.1 الذهاب إلى LinkedIn Developers
1. افتح المتصفح واذهب إلى: https://www.linkedin.com/developers/
2. سجل دخول بحسابك على LinkedIn
3. إذا لم يكن لديك حساب، أنشئ واحد أولاً

### 1.2 إنشاء التطبيق
1. انقر على زر **"Create app"** (أعلى اليمين)
2. املأ النموذج:

   **App name** (اسم التطبيق):
   ```
   Careerak
   ```

   **LinkedIn Page** (صفحة الشركة):
   - إذا كان لديك صفحة شركة، اخترها
   - إذا لم يكن لديك، انقر "Create a new LinkedIn Page"
   - املأ معلومات الشركة:
     - Company name: Careerak
     - Website: https://careerak.com
     - Industry: E-Learning
     - Company size: 1-10 employees

   **Privacy policy URL**:
   ```
   https://careerak.com/policy
   ```

   **App logo** (شعار التطبيق):
   - ارفع شعار Careerak (300x300 بكسل على الأقل)
   - الموقع: `backend/assets/logo.png`

   **Legal agreement**:
   - ✅ وافق على شروط الاستخدام

3. انقر **"Create app"**

---

## 🔐 الخطوة 2: الحصول على المفاتيح

### 2.1 نسخ Client ID و Client Secret

بعد إنشاء التطبيق، ستُعاد توجيهك إلى صفحة التطبيق:

1. اذهب إلى تبويب **"Auth"** (في القائمة الجانبية)

2. ستجد قسم **"Application credentials"**:

   **Client ID**:
   ```
   مثال: 86abc12345def678
   ```
   - انسخه (انقر على أيقونة النسخ)

   **Client Secret**:
   ```
   مثال: AbCdEf123456
   ```
   - انقر على **"Show"** لإظهاره
   - انسخه (انقر على أيقونة النسخ)

⚠️ **مهم جداً**: احتفظ بهذه المفاتيح في مكان آمن ولا تشاركها مع أحد!

---

## 🔗 الخطوة 3: إعداد Redirect URLs

في نفس صفحة "Auth":

### 3.1 إضافة Redirect URLs

1. ابحث عن قسم **"OAuth 2.0 settings"**
2. في حقل **"Authorized redirect URLs for your app"**، أضف:

   **للتطوير المحلي**:
   ```
   http://localhost:3000/linkedin/callback
   ```

   **للإنتاج**:
   ```
   https://careerak.com/linkedin/callback
   ```

3. انقر **"Update"** لحفظ التغييرات

### 3.2 التحقق
- يجب أن ترى الـ URLs في القائمة
- إذا ظهر خطأ، تأكد من:
  - الـ URL صحيح (لا مسافات)
  - يبدأ بـ http:// أو https://
  - ينتهي بـ /linkedin/callback

---

## 📦 الخطوة 4: طلب الصلاحيات (Products)

### 4.1 طلب Sign In with LinkedIn

1. اذهب إلى تبويب **"Products"**
2. ابحث عن **"Sign In with LinkedIn using OpenID Connect"**
3. انقر **"Request access"**
4. املأ النموذج (إذا طُلب منك)
5. انتظر الموافقة (عادة فورية)

### 4.2 طلب Share on LinkedIn

1. في نفس الصفحة، ابحث عن **"Share on LinkedIn"**
2. انقر **"Request access"**
3. املأ النموذج (إذا طُلب منك)
4. انتظر الموافقة (عادة فورية)

### 4.3 التحقق من الصلاحيات

بعد الموافقة، يجب أن ترى:
- ✅ Sign In with LinkedIn using OpenID Connect
- ✅ Share on LinkedIn

---

## 💻 الخطوة 5: إضافة المفاتيح في المشروع

### 5.1 فتح ملف .env

```bash
# في مجلد backend
cd backend
notepad .env
# أو استخدم محرر نصوص آخر
```

### 5.2 إضافة المتغيرات

أضف هذه الأسطر في نهاية الملف:

```env
# LinkedIn OAuth Configuration
LINKEDIN_CLIENT_ID=ضع_client_id_هنا
LINKEDIN_CLIENT_SECRET=ضع_client_secret_هنا
LINKEDIN_REDIRECT_URI=http://localhost:3000/linkedin/callback
FRONTEND_URL=http://localhost:3000
```

### 5.3 استبدال القيم

استبدل:
- `ضع_client_id_هنا` بـ Client ID الذي نسخته
- `ضع_client_secret_هنا` بـ Client Secret الذي نسخته

**مثال**:
```env
LINKEDIN_CLIENT_ID=86abc12345def678
LINKEDIN_CLIENT_SECRET=AbCdEf123456
LINKEDIN_REDIRECT_URI=http://localhost:3000/linkedin/callback
FRONTEND_URL=http://localhost:3000
```

### 5.4 حفظ الملف

احفظ الملف واغلقه.

---

## 🧪 الخطوة 6: الاختبار

### 6.1 إعادة تشغيل السيرفر

```bash
# أوقف السيرفر (Ctrl+C)
# ثم شغله مرة أخرى
npm run dev
```

### 6.2 اختبار OAuth Flow

1. افتح المتصفح: http://localhost:3000
2. سجل دخول
3. اذهب إلى الإعدادات
4. انقر على "ربط حساب LinkedIn"
5. يجب أن تُعاد توجيهك إلى LinkedIn
6. وافق على الصلاحيات
7. يجب أن تُعاد توجيهك إلى Careerak
8. يجب أن ترى "تم ربط حساب LinkedIn بنجاح"

### 6.3 اختبار مشاركة الشهادة

1. اذهب إلى صفحة الشهادات
2. انقر على "مشاركة على LinkedIn"
3. يجب أن يتم نشر المنشور على LinkedIn
4. افتح LinkedIn وتحقق من المنشور

---

## 🔒 الخطوة 7: الأمان (مهم!)

### 7.1 حماية المفاتيح

⚠️ **لا تشارك المفاتيح أبداً**:
- ❌ لا تضعها في Git
- ❌ لا تشاركها في screenshots
- ❌ لا تضعها في الكود مباشرة
- ✅ احتفظ بها في .env فقط

### 7.2 التحقق من .gitignore

تأكد من أن `.env` موجود في `.gitignore`:

```bash
# في المجلد الرئيسي
cat .gitignore | grep .env
```

يجب أن ترى:
```
.env
backend/.env
```

### 7.3 للإنتاج (Production)

عند النشر على Vercel:

1. اذهب إلى Vercel Dashboard
2. اختر المشروع
3. Settings → Environment Variables
4. أضف:
   - `LINKEDIN_CLIENT_ID`
   - `LINKEDIN_CLIENT_SECRET`
   - `LINKEDIN_REDIRECT_URI` = `https://careerak.com/linkedin/callback`
   - `FRONTEND_URL` = `https://careerak.com`

---

## 🐛 استكشاف الأخطاء

### المشكلة 1: "Invalid redirect_uri"

**السبب**: الـ redirect URI غير مطابق

**الحل**:
1. تحقق من أن الـ URL في .env مطابق للـ URL في LinkedIn App
2. تأكد من عدم وجود مسافات
3. تأكد من أن الـ URL ينتهي بـ `/linkedin/callback`

### المشكلة 2: "Invalid client_id"

**السبب**: Client ID خاطئ

**الحل**:
1. تحقق من أنك نسخت Client ID بشكل صحيح
2. تأكد من عدم وجود مسافات إضافية
3. انسخه مرة أخرى من LinkedIn Developers

### المشكلة 3: "Access denied"

**السبب**: لم توافق على الصلاحيات

**الحل**:
1. اذهب إلى LinkedIn Developers
2. تبويب "Products"
3. تأكد من أن "Sign In with LinkedIn" و "Share on LinkedIn" مفعلة

### المشكلة 4: "LinkedIn account not connected"

**السبب**: لم يتم ربط الحساب بعد

**الحل**:
1. اذهب إلى الإعدادات
2. انقر على "ربط حساب LinkedIn"
3. أكمل OAuth flow

---

## ✅ قائمة التحقق النهائية

- [ ] أنشأت تطبيق LinkedIn
- [ ] نسخت Client ID و Client Secret
- [ ] أضفت Redirect URLs
- [ ] طلبت الصلاحيات (Sign In + Share)
- [ ] أضفت المفاتيح في .env
- [ ] أعدت تشغيل السيرفر
- [ ] اختبرت OAuth flow
- [ ] اختبرت مشاركة الشهادة
- [ ] تحققت من .gitignore
- [ ] حفظت المفاتيح في مكان آمن

---

## 📚 المراجع

- [LinkedIn Developers](https://www.linkedin.com/developers/)
- [LinkedIn OAuth 2.0 Documentation](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [LinkedIn Share API](https://docs.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin)

---

## 💡 نصائح إضافية

### للتطوير
- استخدم `http://localhost:3000` في FRONTEND_URL
- استخدم `http://localhost:3000/linkedin/callback` في REDIRECT_URI

### للإنتاج
- استخدم `https://careerak.com` في FRONTEND_URL
- استخدم `https://careerak.com/linkedin/callback` في REDIRECT_URI
- أضف المتغيرات في Vercel Environment Variables

### الأمان
- غيّر Client Secret كل 90 يوم
- راجع الوصول بانتظام
- استخدم HTTPS في الإنتاج دائماً

---

**تاريخ الإنشاء**: 2026-03-13  
**آخر تحديث**: 2026-03-13  
**الحالة**: ✅ جاهز للاستخدام

---

## 🆘 الدعم

إذا واجهت أي مشاكل:
1. راجع قسم "استكشاف الأخطاء" أعلاه
2. تحقق من السجلات (logs) في Backend
3. راجع التوثيق الكامل: `docs/LINKEDIN_INTEGRATION.md`
