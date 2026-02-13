# إصلاح خطوط الرسائل المنبثقة في صفحة اللغات

## المشكلة

الرسائل المنبثقة في صفحة اللغات (Language Page) لا تطبق الخطوط المعتمدة (Amiri للعربية، Cormorant Garamond للإنجليزية، EB Garamond للفرنسية).

### الرسائل المتأثرة
1. **LanguageConfirmModal** - تأكيد اختيار اللغة
2. **AudioSettingsModal** - تفعيل الموسيقى والصوتيات
3. **NotificationSettingsModal** - تفعيل الإشعارات

## السبب

### السبب الرئيسي
صفحة اللغات تظهر قبل تعيين `lang` attribute على `<html>` أو `<body>`، لذلك القواعد العامة في `index.css` لا تطبق:

```css
/* في index.css - لا تعمل في صفحة اللغات */
html[lang="ar"] *,
body[lang="ar"] * {
  font-family: 'Amiri', 'Cairo', serif !important;
}
```

### أسباب ثانوية
1. تعارض مع خطوط `Cairo` المعرّفة في `LanguagePage.css`
2. عدم وجود `font-family` inline في المكونات
3. قواعد CSS في `Modal.css` ليست قوية بما يكفي

## الحل المطبق

### 1. تحديث Modal.css

**إضافة قاعدة إجبار الخطوط**:
```css
/* إجبار الخطوط على جميع عناصر Modal */
.modal-backdrop *,
.modal-content *,
.modal-body *,
.modal-title,
.modal-description,
.modal-actions *,
.modal-confirm-btn,
.modal-cancel-btn {
  font-family: inherit !important;
}
```

**تحسين قواعد dir**:
```css
.modal-backdrop[dir="rtl"],
.modal-backdrop[dir="rtl"] *,
.modal-content[dir="rtl"],
.modal-content[dir="rtl"] *,
.modal-title[dir="rtl"],
.modal-description[dir="rtl"],
.modal-confirm-btn[dir="rtl"],
.modal-cancel-btn[dir="rtl"] {
  font-family: 'Amiri', 'Cairo', serif !important;
}
```

### 2. إضافة Inline Styles

تم إضافة `style` object لجميع العناصر في:

#### NotificationSettingsModal.jsx
```jsx
const fontFamily = language === 'ar' 
  ? "Amiri, Cairo, serif" 
  : language === 'fr' 
    ? "EB Garamond, serif" 
    : "Cormorant Garamond, serif";

// Create inline style object
const fontStyle = {
  fontFamily: fontFamily,
  fontWeight: 'inherit',
  fontStyle: 'inherit'
};

<div className="modal-backdrop" dir={dir} style={fontStyle}>
  <div className="modal-content" dir={dir} style={fontStyle}>
    <div className="modal-body" style={fontStyle}>
      <h2 className="modal-title" style={fontStyle}>{texts.title}</h2>
      <p className="modal-description" style={fontStyle}>{texts.description}</p>
    </div>
    <div className="modal-actions" style={fontStyle}>
      <button className="modal-confirm-btn" style={fontStyle}>
        {texts.confirm}
      </button>
      <button className="modal-cancel-btn" style={fontStyle}>
        {texts.deny}
      </button>
    </div>
  </div>
</div>
```

#### AudioSettingsModal.jsx
نفس النمط مع إضافة `fontStyle` object.

#### LanguageConfirmModal.jsx
نفس النمط مع إضافة `fontStyle` object.

### 3. تحسين Modal.css

**إضافة قواعد خاصة لـ modal-description**:
```css
.modal-description,
.modal-description * {
  font-family: inherit !important;
  font-weight: inherit !important;
  font-style: inherit !important;
}
```

**توسيع قواعد dir**:
```css
.modal-backdrop[dir="rtl"],
.modal-backdrop[dir="rtl"] *,
.modal-content[dir="rtl"],
.modal-content[dir="rtl"] *,
.modal-title[dir="rtl"],
.modal-description[dir="rtl"],
.modal-confirm-btn[dir="rtl"],
.modal-cancel-btn[dir="rtl"],
.modal-body[dir="rtl"],
.modal-body[dir="rtl"] *,
.modal-actions[dir="rtl"],
.modal-actions[dir="rtl"] * {
  font-family: 'Amiri', 'Cairo', serif !important;
}
```

## النتيجة

الآن جميع الرسائل المنبثقة في صفحة اللغات تستخدم الخطوط الصحيحة:
- ✅ العربية: Amiri
- ✅ الإنجليزية: Cormorant Garamond
- ✅ الفرنسية: EB Garamond

## الخطوط المعتمدة

### العربية
- **Primary**: Amiri
- **Fallback**: Cairo
- **Type**: Serif

### الإنجليزية
- **Primary**: Cormorant Garamond
- **Type**: Serif

### الفرنسية
- **Primary**: EB Garamond
- **Type**: Serif

## اختبار التغييرات

### 1. بناء التطبيق
```cmd
cd frontend
npm run build
npx cap sync android
```

### 2. اختبار على الهاتف
1. افتح التطبيق
2. اختر لغة (عربي/إنجليزي/فرنسي)
3. تحقق من الرسائل المنبثقة:
   - رسالة تأكيد اللغة
   - رسالة الموسيقى والصوتيات
   - رسالة الإشعارات
4. تأكد من أن الخط صحيح في كل رسالة

### 3. اختبار على المتصفح
```cmd
cd frontend
npm start
```
ثم افتح: http://localhost:3000

## الملفات المعدلة

1. ✅ `frontend/src/components/modals/Modal.css`
   - إضافة قواعد إجبار الخطوط
   - تحسين قواعد dir

2. ✅ `frontend/src/components/modals/AudioSettingsModal.jsx`
   - إضافة fontFamily inline

3. ✅ `frontend/src/components/modals/LanguageConfirmModal.jsx`
   - إضافة fontFamily inline

4. ✅ `frontend/src/components/modals/NotificationSettingsModal.jsx`
   - إضافة fontFamily inline

## ملاحظات مهمة

### 1. Inline Styles vs CSS

استخدمنا inline styles لأن:
- صفحة اللغات تظهر قبل تعيين `lang` attribute
- CSS selectors تعتمد على `lang` أو `dir`
- Inline styles لها أولوية أعلى

### 2. Font Fallbacks

دائمًا نضع fallback fonts:
```jsx
"'Amiri', 'Cairo', serif"  // Amiri أولاً، ثم Cairo، ثم أي serif
```

### 3. Font Loading

تأكد من تحميل الخطوط في `fonts.css`:
```css
@font-face {
  font-family: 'Amiri';
  src: url('./amiri/Amiri-Regular.woff2') format('woff2');
}
```

## المشاكل المحتملة

### المشكلة: الخط لا يزال غير صحيح

**الحل**:
1. تحقق من تحميل ملف `fonts.css`
2. افحص console للأخطاء
3. تأكد من وجود ملفات الخطوط في `assets/fonts/`
4. امسح cache المتصفح

### المشكلة: الخط يعمل في المتصفح لكن ليس في التطبيق

**الحل**:
1. تأكد من sync مع Capacitor: `npx cap sync android`
2. أعد بناء التطبيق
3. تحقق من أن ملفات الخطوط موجودة في build

### المشكلة: بعض الكلمات بخط مختلف

**الحل**:
تحقق من أن جميع العناصر لها `style={{ fontFamily }}`:
```jsx
<div style={{ fontFamily }}>
  <h2 style={{ fontFamily }}>Title</h2>
  <p style={{ fontFamily }}>Description</p>
  <button style={{ fontFamily }}>Button</button>
</div>
```

## الخلاصة

تم حل مشكلة الخطوط في الرسائل المنبثقة لصفحة اللغات من خلال:
1. ✅ تحسين قواعد CSS في Modal.css
2. ✅ إضافة inline styles لجميع العناصر
3. ✅ استخدام fontFamily حسب اللغة المختارة

الآن جميع الرسائل تظهر بالخطوط الصحيحة المعتمدة! 🎉

---

**التاريخ**: 2026-02-11  
**المهندس**: Eng.AlaaUddien  
**الحالة**: ✅ تم الإصلاح
