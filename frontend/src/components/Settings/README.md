# Settings Components

مكونات صفحة الإعدادات المحسّنة لمنصة Careerak.

## المكونات

### AccountTab
المكون الرئيسي لتبويب الحساب في صفحة الإعدادات.

**الميزات:**
- تعديل الملف الشخصي (الاسم، اللغة، المنطقة الزمنية)
- رفع وقص صورة الملف الشخصي (react-easy-crop)
- تغيير البريد الإلكتروني (تدفق متعدد الخطوات مع OTP)
- تغيير رقم الهاتف (تدفق متعدد الخطوات مع OTP)
- تغيير كلمة المرور (مع فحص القوة)
- دعم متعدد اللغات (ar, en, fr)
- دعم Dark Mode
- تصميم متجاوب

**الاستخدام:**
```jsx
import { AccountTab } from '../components/Settings';

<AccountTab />
```

### ProfileEditForm
نموذج تعديل معلومات الملف الشخصي.

**الميزات:**
- تعديل الاسم
- رفع صورة الملف الشخصي
- قص الصورة باستخدام react-easy-crop
- التحقق من حجم الصورة (max 5MB)
- التحقق من صيغة الصورة (JPG, PNG, WebP)
- تغيير اللغة
- تغيير المنطقة الزمنية

**Props:**
- `onUpdate(success: boolean, message: string)`: callback عند التحديث

**الاستخدام:**
```jsx
import { ProfileEditForm } from '../components/Settings';

<ProfileEditForm 
  onUpdate={(success, message) => {
    if (success) {
      console.log('Success:', message);
    } else {
      console.error('Error:', message);
    }
  }}
/>
```

### EmailChangeModal
مودال تغيير البريد الإلكتروني مع تدفق متعدد الخطوات.

**التدفق:**
1. إدخال البريد الجديد
2. التحقق من البريد القديم (OTP)
3. التحقق من البريد الجديد (OTP)
4. تأكيد كلمة المرور

**Props:**
- `onClose()`: callback عند إغلاق المودال
- `onSuccess(message: string)`: callback عند النجاح
- `onError(message: string)`: callback عند الخطأ

**الاستخدام:**
```jsx
import { EmailChangeModal } from '../components/Settings';

<EmailChangeModal
  onClose={() => setShowModal(false)}
  onSuccess={(message) => console.log(message)}
  onError={(message) => console.error(message)}
/>
```

### PhoneChangeModal
مودال تغيير رقم الهاتف مع تدفق متعدد الخطوات.

**التدفق:**
1. إدخال الرقم الجديد
2. التحقق من OTP

**Props:**
- `onClose()`: callback عند إغلاق المودال
- `onSuccess(message: string)`: callback عند النجاح
- `onError(message: string)`: callback عند الخطأ

**الاستخدام:**
```jsx
import { PhoneChangeModal } from '../components/Settings';

<PhoneChangeModal
  onClose={() => setShowModal(false)}
  onSuccess={(message) => console.log(message)}
  onError={(message) => console.error(message)}
/>
```

### PasswordChangeModal
مودال تغيير كلمة المرور مع فحص القوة.

**الميزات:**
- فحص قوة كلمة المرور (5 معايير)
- مؤشر بصري للقوة
- إظهار/إخفاء كلمة المرور
- تحذير من تسجيل الخروج من الأجهزة الأخرى

**المعايير:**
- على الأقل 8 أحرف
- حرف كبير واحد على الأقل
- حرف صغير واحد على الأقل
- رقم واحد على الأقل
- رمز خاص واحد على الأقل

**Props:**
- `onClose()`: callback عند إغلاق المودال
- `onSuccess(message: string)`: callback عند النجاح
- `onError(message: string)`: callback عند الخطأ

**الاستخدام:**
```jsx
import { PasswordChangeModal } from '../components/Settings';

<PasswordChangeModal
  onClose={() => setShowModal(false)}
  onSuccess={(message) => console.log(message)}
  onError={(message) => console.error(message)}
/>
```

## الأدوات المساعدة

### cropImage.js
دوال مساعدة لقص الصور.

**الدوال:**
- `getCroppedImg(imageSrc, pixelCrop)`: قص الصورة وإرجاع data URL
- `getRotationFromExif(file)`: الحصول على زاوية الدوران من EXIF

## الأنماط

### AccountTab.css
أنماط المكون الرئيسي AccountTab.

### ProfileEditForm.css
أنماط نموذج تعديل الملف الشخصي.

### Modal.css
أنماط مشتركة لجميع المودالات.

**الميزات:**
- تصميم متجاوب
- دعم Dark Mode
- دعم RTL/LTR
- انتقالات سلسة
- accessibility كامل

## الاختبارات

### AccountTab.test.jsx
اختبارات شاملة لجميع المكونات.

**التغطية:**
- ✅ تحديث الملف الشخصي
- ✅ رفض صورة كبيرة (> 5MB)
- ✅ رفض صيغة غير صحيحة
- ✅ قبول صورة صحيحة
- ✅ تدفق تغيير البريد الكامل
- ✅ تدفق تغيير الهاتف الكامل
- ✅ تدفق تغيير كلمة المرور الكامل
- ✅ رفض كلمة مرور ضعيفة
- ✅ رفض كلمات مرور غير متطابقة
- ✅ معالجة الأخطاء

**تشغيل الاختبارات:**
```bash
npm test -- AccountTab.test.jsx
```

## API Endpoints

### Profile
- `PUT /api/settings/profile` - تحديث الملف الشخصي

### Email Change
- `POST /api/settings/email/change` - بدء تغيير البريد
- `POST /api/settings/email/verify-old` - التحقق من البريد القديم
- `POST /api/settings/email/verify-new` - التحقق من البريد الجديد
- `POST /api/settings/email/verify` - تأكيد التغيير
- `POST /api/settings/email/resend-otp` - إعادة إرسال OTP

### Phone Change
- `POST /api/settings/phone/change` - بدء تغيير الهاتف
- `POST /api/settings/phone/verify` - التحقق والتأكيد
- `POST /api/settings/phone/resend-otp` - إعادة إرسال OTP

### Password Change
- `POST /api/settings/password/change` - تغيير كلمة المرور

## المتطلبات

### Dependencies
- `react-easy-crop`: ^5.0.0 - لقص الصور
- `react`: ^18.0.0
- `react-dom`: ^18.0.0

### Dev Dependencies
- `@testing-library/react`: ^14.0.0
- `@testing-library/user-event`: ^14.0.0
- `vitest`: ^1.0.0

## التثبيت

```bash
npm install react-easy-crop
```

## الملاحظات

- جميع المكونات تدعم RTL/LTR
- جميع المكونات تدعم Dark Mode
- جميع المكونات متجاوبة (Mobile, Tablet, Desktop)
- جميع المكونات تدعم 3 لغات (ar, en, fr)
- جميع المكونات تتبع معايير التصميم (project-standards.md)
- جميع الإطارات باللون النحاسي الباهت (#D4816180)
- جميع الاختبارات نجحت ✅

## الأمان

- التحقق من حجم الصورة (max 5MB)
- التحقق من صيغة الصورة (JPG, PNG, WebP فقط)
- فحص قوة كلمة المرور (5 معايير)
- OTP للتحقق من البريد والهاتف
- تأكيد كلمة المرور للتغييرات الحساسة
- تسجيل خروج من الأجهزة الأخرى عند تغيير كلمة المرور

## الدعم

للمزيد من المعلومات، راجع:
- `docs/SETTINGS_PAGE_ENHANCEMENTS.md`
- `.kiro/specs/settings-page-enhancements/`
