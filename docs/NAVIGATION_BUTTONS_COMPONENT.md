# NavigationButtons Component - توثيق شامل

## 📋 معلومات المكون

- **الاسم**: NavigationButtons
- **الموقع**: `frontend/src/components/auth/NavigationButtons.jsx`
- **الحالة**: ✅ مكتمل ومفعّل
- **تاريخ الإنشاء**: 2026-02-23
- **المتطلبات**: Requirements 5.6, 5.7, 8.5

---

## 🎯 الغرض

مكون أزرار التنقل بين خطوات التسجيل في صفحة AuthPage. يوفر:
- زر "التالي" للانتقال للخطوة التالية
- زر "السابق" للعودة للخطوة السابقة
- زر "تخطي" للخطوات الاختيارية
- Loading state عند الإرسال
- تعطيل تلقائي حتى ملء الحقول المطلوبة

---

## 📦 Props

| Prop | النوع | الافتراضي | الوصف |
|------|-------|-----------|-------|
| `currentStep` | `number` | - | الخطوة الحالية (1-4) |
| `totalSteps` | `number` | `4` | إجمالي عدد الخطوات |
| `onNext` | `function` | - | دالة الانتقال للخطوة التالية |
| `onPrevious` | `function` | - | دالة العودة للخطوة السابقة |
| `onSkip` | `function` | - | دالة تخطي الخطوة |
| `isNextDisabled` | `boolean` | `false` | تعطيل زر "التالي" |
| `isLoading` | `boolean` | `false` | حالة التحميل |
| `isOptionalStep` | `boolean` | `false` | هل الخطوة اختيارية؟ |
| `language` | `string` | `'ar'` | اللغة (`ar`, `en`, `fr`) |

---

## 🚀 الاستخدام الأساسي

```jsx
import NavigationButtons from '../components/auth/NavigationButtons';

function MyForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const isNextDisabled = () => {
    // منطق التحقق من الحقول المطلوبة
    return false;
  };

  return (
    <form>
      {/* محتوى النموذج */}
      
      <NavigationButtons
        currentStep={currentStep}
        totalSteps={4}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSkip={handleSkip}
        isNextDisabled={isNextDisabled()}
        isLoading={isLoading}
        isOptionalStep={currentStep === 4}
        language="ar"
      />
    </form>
  );
}
```

---

## 🎨 الميزات

### 1. زر "التالي" (Requirement 5.6)

- يظهر في جميع الخطوات
- يتحول إلى "إرسال" في الخطوة الأخيرة
- يُعطّل حتى ملء الحقول المطلوبة (Requirement 8.5)
- يعرض loading spinner عند الإرسال

```jsx
// في الخطوات 1-3
<button>التالي →</button>

// في الخطوة 4
<button type="submit">إرسال</button>

// أثناء التحميل
<button disabled>جاري الإرسال... ⟳</button>
```

### 2. زر "السابق" (Requirement 5.6)

- يظهر من الخطوة الثانية فقط
- يسمح بالعودة للخطوة السابقة
- يُعطّل أثناء التحميل

```jsx
// الخطوة 1: لا يظهر
// الخطوات 2-4: يظهر
<button>→ السابق</button>
```

### 3. زر "تخطي" (Requirement 5.7)

- يظهر فقط في الخطوات الاختيارية
- لا يظهر في الخطوة الأخيرة
- يسمح بتخطي الخطوة الحالية

```jsx
// الخطوة 4 (اختيارية)
<button>تخطي</button>
```

### 4. Loading State (Requirement 8.5)

- يعرض spinner أثناء الإرسال
- يعطل جميع الأزرار
- يغير نص الزر إلى "جاري الإرسال..."

```jsx
<button disabled aria-busy="true">
  جاري الإرسال...
  <span className="navigation-btn-spinner">⟳</span>
</button>
```

---

## 🌍 دعم اللغات

المكون يدعم 3 لغات:

### العربية (ar)
```jsx
<NavigationButtons language="ar" />
// التالي، السابق، تخطي، إرسال، جاري الإرسال...
```

### الإنجليزية (en)
```jsx
<NavigationButtons language="en" />
// Next, Previous, Skip, Submit, Submitting...
```

### الفرنسية (fr)
```jsx
<NavigationButtons language="fr" />
// Suivant, Précédent, Passer, Soumettre, Envoi en cours...
```

---

## 🎨 التصميم

### الألوان

```css
/* Primary Button (Next/Submit) */
background: #D48161 (Accent)
hover: #c06f51

/* Secondary Button (Previous) */
border: #304B60 (Primary)
hover: background #304B60

/* Skip Button */
border: #D1D5DB (Light gray)
hover: background #F3F4F6
```

### الأحجام

```css
/* Desktop */
padding: 0.75rem 1.5rem
font-size: 1rem
min-width: 120px

/* Mobile */
padding: 0.625rem 1.25rem
font-size: 0.875rem
min-width: 100px
```

---

## ♿ إمكانية الوصول

### ARIA Attributes

```jsx
<button
  aria-label="التالي"
  aria-busy={isLoading}
  aria-disabled={isNextDisabled}
>
  التالي
</button>
```

### Keyboard Navigation

- `Tab`: التنقل بين الأزرار
- `Enter` / `Space`: تفعيل الزر
- `Shift + Tab`: العودة للخلف

### Screen Reader Support

- يعلن عن حالة الزر (معطل، محمّل)
- يعلن عن نص الزر
- يعلن عن نوع الزر (button, submit)

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  .navigation-btn {
    border-width: 3px;
  }
  
  .navigation-btn-primary {
    background-color: #000;
    color: #fff;
  }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .navigation-btn {
    transition: none;
  }
  
  .navigation-btn:hover {
    transform: none;
  }
}
```

---

## 📱 Responsive Design

### Desktop (> 640px)

```
[السابق]  [spacer]  [تخطي]  [التالي]
```

### Mobile (≤ 639px)

```
[السابق]  [تخطي]  [التالي]
```

- الأزرار تأخذ العرض الكامل
- Spacer يختفي
- Font size أصغر

---

## 🔄 تدفق العمل

### الخطوة 1 (المعلومات الأساسية)

```
[التالي] (معطل حتى ملء الاسم)
```

### الخطوة 2 (كلمة المرور)

```
[السابق]  [التالي] (معطل حتى ملء كلمة المرور)
```

### الخطوة 3 (نوع الحساب)

```
[السابق]  [التالي] (معطل حتى اختيار النوع)
```

### الخطوة 4 (التفاصيل - اختيارية)

```
[السابق]  [تخطي]  [إرسال]
```

---

## 🧪 أمثلة الاستخدام

### مثال 1: نموذج بسيط

```jsx
<NavigationButtons
  currentStep={1}
  totalSteps={4}
  onNext={() => console.log('Next')}
  onPrevious={() => console.log('Previous')}
  onSkip={() => console.log('Skip')}
  isNextDisabled={false}
  isLoading={false}
  isOptionalStep={false}
  language="ar"
/>
```

### مثال 2: مع التحقق من الحقول

```jsx
const isNextDisabled = () => {
  switch (currentStep) {
    case 1:
      return !formData.name.trim();
    case 2:
      return !formData.password;
    case 3:
      return !userType;
    case 4:
      return false; // اختياري
    default:
      return false;
  }
};

<NavigationButtons
  currentStep={currentStep}
  totalSteps={4}
  onNext={handleNext}
  onPrevious={handlePrevious}
  onSkip={handleSkip}
  isNextDisabled={isNextDisabled()}
  isLoading={isSubmitting}
  isOptionalStep={currentStep === 4}
  language="ar"
/>
```

### مثال 3: مع حفظ التقدم

```jsx
const handleNext = () => {
  if (currentStep < 4) {
    setCurrentStep(prev => prev + 1);
    
    // حفظ التقدم
    saveProgress(currentStep + 1, formData);
  }
};

<NavigationButtons
  currentStep={currentStep}
  totalSteps={4}
  onNext={handleNext}
  onPrevious={handlePrevious}
  onSkip={handleSkip}
  isNextDisabled={isNextDisabled()}
  isLoading={isSubmitting}
  isOptionalStep={currentStep === 4}
  language="ar"
/>
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: زر "التالي" لا يعمل

**الحل**:
```jsx
// تأكد من تمرير دالة onNext
<NavigationButtons
  onNext={handleNext} // ✅
  // onNext={handleNext()} // ❌ خطأ
/>
```

### المشكلة: زر "السابق" لا يظهر

**الحل**:
```jsx
// تأكد من أن currentStep > 1
<NavigationButtons
  currentStep={2} // ✅ يظهر
  currentStep={1} // ❌ لا يظهر
/>
```

### المشكلة: زر "تخطي" لا يظهر

**الحل**:
```jsx
// تأكد من أن isOptionalStep = true
<NavigationButtons
  isOptionalStep={true} // ✅ يظهر
  isOptionalStep={false} // ❌ لا يظهر
/>
```

### المشكلة: Loading spinner لا يظهر

**الحل**:
```jsx
// تأكد من أن isLoading = true
<NavigationButtons
  isLoading={true} // ✅ يظهر
  isLoading={false} // ❌ لا يظهر
/>
```

---

## 📊 الأداء

### Bundle Size
- Component: ~2KB (minified)
- CSS: ~3KB (minified)
- Total: ~5KB

### Rendering
- Re-renders فقط عند تغيير props
- لا side effects
- Pure component

---

## ✅ Checklist

- [x] زر "التالي" يعمل
- [x] زر "السابق" يعمل
- [x] زر "تخطي" يعمل
- [x] تعطيل زر "التالي" حتى ملء الحقول
- [x] Loading state عند الإرسال
- [x] دعم RTL/LTR
- [x] دعم 3 لغات
- [x] Responsive design
- [x] Accessibility support
- [x] High contrast mode
- [x] Reduced motion
- [x] Keyboard navigation

---

## 📚 المراجع

- **Requirements**: `.kiro/specs/enhanced-auth/requirements.md`
- **Design**: `.kiro/specs/enhanced-auth/design.md`
- **Tasks**: `.kiro/specs/enhanced-auth/tasks.md`
- **Component**: `frontend/src/components/auth/NavigationButtons.jsx`
- **Styles**: `frontend/src/components/auth/NavigationButtons.css`
- **Example**: `frontend/src/examples/NavigationButtonsUsage.jsx`

---

**تاريخ الإنشاء**: 2026-02-23  
**آخر تحديث**: 2026-02-23  
**الحالة**: ✅ مكتمل ومفعّل
