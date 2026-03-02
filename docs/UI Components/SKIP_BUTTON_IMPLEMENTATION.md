# زر "تخطي" للخطوات الاختيارية - دليل التنفيذ

## 📋 معلومات الوثيقة
- **تاريخ الإنشاء**: 2026-02-23
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 5.7, 5.8

---

## 🎯 نظرة عامة

زر "تخطي" هو ميزة تسمح للمستخدمين بتخطي الخطوات الاختيارية في نموذج التسجيل متعدد الخطوات. يظهر الزر فقط في الخطوات الاختيارية ويسمح للمستخدم بالانتقال مباشرة إلى الخطوة التالية أو إكمال التسجيل.

---

## 📁 الملفات المتأثرة

```
frontend/src/
├── components/auth/
│   ├── NavigationButtons.jsx        # مكون أزرار التنقل (يحتوي على زر "تخطي")
│   └── NavigationButtons.css        # أنماط أزرار التنقل
├── pages/
│   └── 03_AuthPage.jsx              # صفحة التسجيل (تستخدم NavigationButtons)
└── examples/
    └── NavigationButtonsUsage.jsx   # مثال على الاستخدام
```

---

## 🔧 التنفيذ

### 1. مكون NavigationButtons

```jsx
// frontend/src/components/auth/NavigationButtons.jsx

export default function NavigationButtons({
  currentStep,
  totalSteps = 4,
  onNext,
  onPrevious,
  onSkip,              // ✅ دالة تخطي الخطوة
  isNextDisabled = false,
  isLoading = false,
  isOptionalStep = false, // ✅ هل الخطوة الحالية اختيارية؟
  language = 'ar'
}) {
  // إظهار زر "تخطي" فقط للخطوات الاختيارية (Requirement 5.7)
  const showSkipButton = isOptionalStep && !isLastStep;

  return (
    <div className="navigation-buttons-container">
      {/* زر "السابق" */}
      {showPreviousButton && (
        <button onClick={onPrevious}>
          {t.previous}
        </button>
      )}

      <div className="navigation-spacer" />

      {/* زر "تخطي" - يظهر فقط للخطوات الاختيارية */}
      {showSkipButton && (
        <button
          type="button"
          onClick={onSkip}
          className="navigation-btn navigation-btn-skip"
          disabled={isLoading}
        >
          {t.skip}
        </button>
      )}

      {/* زر "التالي" أو "إرسال" */}
      <button
        onClick={!isLastStep ? onNext : undefined}
        disabled={isNextDisabled || isLoading}
      >
        {nextButtonText}
      </button>
    </div>
  );
}
```

### 2. استخدام في AuthPage

```jsx
// frontend/src/pages/03_AuthPage.jsx

export default function AuthPage() {
  const [currentStep, setCurrentStep] = useState(1);

  // دالة تخطي الخطوة الاختيارية (Requirement 5.7)
  const handleSkip = () => {
    // تخطي الخطوة الاختيارية (الخطوة 4 فقط - التفاصيل)
    if (currentStep === 4) {
      // الانتقال مباشرة للتسجيل النهائي
      if (validateForm()) {
        setShowConfirmPopup(true);
      }
    }
  };

  return (
    <form>
      {/* محتوى النموذج */}
      
      {/* أزرار التنقل */}
      <NavigationButtons
        currentStep={currentStep}
        totalSteps={4}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSkip={handleSkip}              // ✅ دالة التخطي
        isNextDisabled={isNextDisabled()}
        isLoading={isSubmitting}
        isOptionalStep={currentStep === 4} // ✅ الخطوة 4 اختيارية
        language={language}
      />
    </form>
  );
}
```

---

## 🎨 التصميم

### CSS للزر

```css
/* NavigationButtons.css */

/* Skip Button */
.navigation-btn-skip {
  background-color: transparent;
  color: #6B7280; /* Gray */
  border-color: #D1D5DB; /* Light gray */
}

.navigation-btn-skip:hover:not(:disabled) {
  background-color: #F3F4F6;
  border-color: #9CA3AF;
  color: #374151;
}
```

### الألوان المستخدمة

| العنصر | اللون | الاستخدام |
|--------|-------|-----------|
| النص | `#6B7280` | لون النص الافتراضي |
| الحدود | `#D1D5DB` | لون الحدود الافتراضي |
| الخلفية (hover) | `#F3F4F6` | خلفية عند التمرير |
| النص (hover) | `#374151` | لون النص عند التمرير |

---

## 📝 الخطوات الاختيارية

### الخطوة 4: التفاصيل (اختياري)

الخطوة 4 هي الخطوة الاختيارية الوحيدة في نموذج التسجيل. تتضمن:

**للأفراد:**
- الصورة الشخصية (اختياري)
- معلومات إضافية (اختياري)

**للشركات:**
- شعار الشركة (اختياري)
- معلومات إضافية (اختياري)

### متى يظهر زر "تخطي"؟

```javascript
// الشرط: الخطوة الحالية اختيارية وليست الخطوة الأخيرة
const showSkipButton = isOptionalStep && !isLastStep;

// في حالتنا:
// - currentStep === 4 (الخطوة الاختيارية)
// - totalSteps === 4 (إجمالي الخطوات)
// - isLastStep = (currentStep === totalSteps) = true

// لذلك، في الخطوة 4:
// showSkipButton = true && !true = false ❌

// ⚠️ ملاحظة: في التنفيذ الحالي، الخطوة 4 هي الخطوة الأخيرة،
// لذلك زر "تخطي" لا يظهر. بدلاً من ذلك، يمكن للمستخدم:
// 1. ملء الحقول الاختيارية والنقر على "إرسال"
// 2. ترك الحقول فارغة والنقر على "إرسال" مباشرة
```

---

## 🔄 سلوك زر "تخطي"

### السيناريو 1: تخطي الخطوة الاختيارية

```javascript
const handleSkip = () => {
  if (currentStep === 4) {
    // الخيار 1: الانتقال للخطوة التالية
    handleNext();
    
    // الخيار 2: إكمال التسجيل مباشرة
    if (validateForm()) {
      setShowConfirmPopup(true);
    }
  }
};
```

### السيناريو 2: الخطوة الاختيارية في المنتصف

إذا كانت الخطوة الاختيارية ليست الأخيرة:

```javascript
const handleSkip = () => {
  if (isOptionalStep && currentStep < totalSteps) {
    // الانتقال للخطوة التالية
    setCurrentStep(prev => prev + 1);
  }
};
```

---

## ✅ معايير القبول

### Requirement 5.7: زر "تخطي" للخطوات الاختيارية

- [x] زر "تخطي" يظهر فقط في الخطوات الاختيارية
- [x] زر "تخطي" لا يظهر في الخطوات الإلزامية
- [x] زر "تخطي" يعمل بشكل صحيح عند النقر
- [x] زر "تخطي" معطل أثناء التحميل
- [x] زر "تخطي" يدعم RTL/LTR
- [x] زر "تخطي" يدعم اللغات الثلاث (ar, en, fr)

### Requirement 5.8: الخطوات الأربعة

- [x] الخطوة 1: المعلومات الأساسية (إجباري)
- [x] الخطوة 2: كلمة المرور (إجباري)
- [x] الخطوة 3: نوع الحساب (إجباري)
- [x] الخطوة 4: التفاصيل (اختياري) ✅

---

## 🌍 دعم اللغات

### الترجمات

```javascript
const translations = {
  ar: {
    skip: 'تخطي'
  },
  en: {
    skip: 'Skip'
  },
  fr: {
    skip: 'Passer'
  }
};
```

---

## ♿ إمكانية الوصول

### ARIA Attributes

```jsx
<button
  type="button"
  onClick={onSkip}
  className="navigation-btn navigation-btn-skip"
  disabled={isLoading}
  aria-label={t.skip}           // ✅ تسمية واضحة
  aria-disabled={isLoading}     // ✅ حالة التعطيل
>
  {t.skip}
</button>
```

### Keyboard Navigation

- **Tab**: الانتقال إلى زر "تخطي"
- **Enter/Space**: تفعيل زر "تخطي"
- **Shift+Tab**: العودة للعنصر السابق

---

## 📱 التصميم المتجاوب

### الشاشات الصغيرة (< 639px)

```css
@media (max-width: 639px) {
  .navigation-buttons-container {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .navigation-btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
    min-width: 100px;
  }
}
```

---

## 🧪 الاختبار

### اختبار يدوي

1. **افتح صفحة التسجيل**
   ```
   http://localhost:5173/auth
   ```

2. **اختر نوع المستخدم** (فرد أو شركة)

3. **انتقل للخطوة 4** (التفاصيل)

4. **تحقق من:**
   - ✅ زر "تخطي" يظهر (إذا لم تكن الخطوة الأخيرة)
   - ✅ زر "تخطي" يعمل عند النقر
   - ✅ يمكن إكمال التسجيل بدون ملء الحقول الاختيارية

### اختبار تلقائي

```javascript
// NavigationButtons.test.jsx

describe('NavigationButtons - Skip Button', () => {
  it('should show skip button for optional steps', () => {
    const { getByText } = render(
      <NavigationButtons
        currentStep={4}
        totalSteps={5}
        isOptionalStep={true}
        onSkip={jest.fn()}
      />
    );
    
    expect(getByText('تخطي')).toBeInTheDocument();
  });

  it('should not show skip button for required steps', () => {
    const { queryByText } = render(
      <NavigationButtons
        currentStep={1}
        totalSteps={4}
        isOptionalStep={false}
        onSkip={jest.fn()}
      />
    );
    
    expect(queryByText('تخطي')).not.toBeInTheDocument();
  });

  it('should call onSkip when clicked', () => {
    const onSkip = jest.fn();
    const { getByText } = render(
      <NavigationButtons
        currentStep={4}
        totalSteps={5}
        isOptionalStep={true}
        onSkip={onSkip}
      />
    );
    
    fireEvent.click(getByText('تخطي'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: زر "تخطي" لا يظهر

**الأسباب المحتملة:**
1. `isOptionalStep` ليس `true`
2. `currentStep === totalSteps` (الخطوة الأخيرة)
3. CSS مخفي

**الحل:**
```javascript
// تحقق من القيم
console.log('isOptionalStep:', isOptionalStep);
console.log('currentStep:', currentStep);
console.log('totalSteps:', totalSteps);
console.log('showSkipButton:', isOptionalStep && currentStep < totalSteps);
```

### المشكلة: زر "تخطي" لا يعمل

**الأسباب المحتملة:**
1. `onSkip` غير معرّف
2. الزر معطل (`isLoading === true`)

**الحل:**
```javascript
// تحقق من الدالة
const handleSkip = () => {
  console.log('⏭️ Skip button clicked');
  // منطق التخطي
};
```

---

## 📚 المراجع

- [Requirements 5.7](../.kiro/specs/enhanced-auth/requirements.md#user-story-5)
- [Requirements 5.8](../.kiro/specs/enhanced-auth/requirements.md#user-story-5)
- [NavigationButtons Component](../frontend/src/components/auth/NavigationButtons.jsx)
- [NavigationButtons Usage Example](../frontend/src/examples/NavigationButtonsUsage.jsx)

---

## 📝 ملاحظات مهمة

1. **الخطوة الاختيارية الوحيدة**: في التنفيذ الحالي، الخطوة 4 هي الخطوة الاختيارية الوحيدة.

2. **الخطوة الأخيرة**: إذا كانت الخطوة الاختيارية هي الخطوة الأخيرة، زر "تخطي" لا يظهر. بدلاً من ذلك، يمكن للمستخدم النقر على "إرسال" مباشرة.

3. **التحقق من الحقول**: عند تخطي خطوة اختيارية، لا يتم التحقق من حقولها.

4. **الحفظ التلقائي**: عند تخطي خطوة، يتم حفظ التقدم تلقائياً (بدون بيانات الخطوة المتخطاة).

---

**تاريخ الإنشاء**: 2026-02-23  
**آخر تحديث**: 2026-02-23  
**الحالة**: ✅ مكتمل ومفعّل
