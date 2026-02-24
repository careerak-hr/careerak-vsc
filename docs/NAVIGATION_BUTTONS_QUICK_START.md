# NavigationButtons - دليل البدء السريع ⚡

## 🚀 البدء في 5 دقائق

### 1. الاستيراد (30 ثانية)

```jsx
import NavigationButtons from '../components/auth/NavigationButtons';
```

### 2. الإعداد الأساسي (دقيقة)

```jsx
function MyForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <form>
      {/* محتوى النموذج */}
      
      <NavigationButtons
        currentStep={currentStep}
        totalSteps={4}
        onNext={() => setCurrentStep(prev => prev + 1)}
        onPrevious={() => setCurrentStep(prev => prev - 1)}
        onSkip={() => setCurrentStep(prev => prev + 1)}
        isNextDisabled={false}
        isLoading={isLoading}
        isOptionalStep={false}
        language="ar"
      />
    </form>
  );
}
```

### 3. إضافة التحقق (دقيقتان)

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
  onNext={() => setCurrentStep(prev => prev + 1)}
  onPrevious={() => setCurrentStep(prev => prev - 1)}
  onSkip={() => setCurrentStep(prev => prev + 1)}
  isNextDisabled={isNextDisabled()} // ✅
  isLoading={isLoading}
  isOptionalStep={currentStep === 4}
  language="ar"
/>
```

### 4. إضافة Loading State (دقيقة)

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true); // ✅
  
  try {
    await submitForm(formData);
  } finally {
    setIsLoading(false); // ✅
  }
};

<NavigationButtons
  currentStep={currentStep}
  totalSteps={4}
  onNext={() => setCurrentStep(prev => prev + 1)}
  onPrevious={() => setCurrentStep(prev => prev - 1)}
  onSkip={() => setCurrentStep(prev => prev + 1)}
  isNextDisabled={isNextDisabled()}
  isLoading={isLoading} // ✅
  isOptionalStep={currentStep === 4}
  language="ar"
/>
```

---

## 📋 Props السريعة

| Prop | مطلوب؟ | الافتراضي | مثال |
|------|--------|-----------|------|
| `currentStep` | ✅ | - | `1` |
| `totalSteps` | ❌ | `4` | `4` |
| `onNext` | ✅ | - | `() => setStep(2)` |
| `onPrevious` | ✅ | - | `() => setStep(1)` |
| `onSkip` | ✅ | - | `() => setStep(4)` |
| `isNextDisabled` | ❌ | `false` | `true` |
| `isLoading` | ❌ | `false` | `true` |
| `isOptionalStep` | ❌ | `false` | `true` |
| `language` | ❌ | `'ar'` | `'en'` |

---

## 🎯 حالات الاستخدام الشائعة

### حالة 1: نموذج بسيط (3 خطوات)

```jsx
<NavigationButtons
  currentStep={currentStep}
  totalSteps={3}
  onNext={() => setCurrentStep(prev => prev + 1)}
  onPrevious={() => setCurrentStep(prev => prev - 1)}
  language="ar"
/>
```

### حالة 2: مع خطوة اختيارية

```jsx
<NavigationButtons
  currentStep={currentStep}
  totalSteps={4}
  onNext={() => setCurrentStep(prev => prev + 1)}
  onPrevious={() => setCurrentStep(prev => prev - 1)}
  onSkip={() => setCurrentStep(prev => prev + 1)}
  isOptionalStep={currentStep === 4} // ✅
  language="ar"
/>
```

### حالة 3: مع تعطيل شرطي

```jsx
<NavigationButtons
  currentStep={currentStep}
  totalSteps={4}
  onNext={() => setCurrentStep(prev => prev + 1)}
  onPrevious={() => setCurrentStep(prev => prev - 1)}
  isNextDisabled={!formData.email} // ✅
  language="ar"
/>
```

### حالة 4: مع حفظ التقدم

```jsx
const handleNext = () => {
  setCurrentStep(prev => prev + 1);
  saveProgress(currentStep + 1, formData); // ✅
};

<NavigationButtons
  currentStep={currentStep}
  totalSteps={4}
  onNext={handleNext}
  onPrevious={() => setCurrentStep(prev => prev - 1)}
  language="ar"
/>
```

---

## 🌍 اللغات

```jsx
// العربية
<NavigationButtons language="ar" />

// الإنجليزية
<NavigationButtons language="en" />

// الفرنسية
<NavigationButtons language="fr" />
```

---

## ✅ Checklist السريع

قبل الاستخدام، تأكد من:

- [ ] استيراد المكون
- [ ] تمرير `currentStep`
- [ ] تمرير `onNext`, `onPrevious`, `onSkip`
- [ ] إضافة منطق `isNextDisabled`
- [ ] إضافة `isLoading` state
- [ ] تحديد `isOptionalStep` للخطوات الاختيارية
- [ ] اختيار اللغة المناسبة

---

## 🐛 مشاكل شائعة

### المشكلة: الأزرار لا تظهر

```jsx
// ❌ خطأ
<NavigationButtons />

// ✅ صحيح
<NavigationButtons
  currentStep={1}
  onNext={() => {}}
  onPrevious={() => {}}
  onSkip={() => {}}
/>
```

### المشكلة: زر "التالي" لا يعمل

```jsx
// ❌ خطأ
<NavigationButtons onNext={handleNext()} />

// ✅ صحيح
<NavigationButtons onNext={handleNext} />
```

### المشكلة: زر "تخطي" لا يظهر

```jsx
// ❌ خطأ
<NavigationButtons isOptionalStep={false} />

// ✅ صحيح
<NavigationButtons isOptionalStep={true} />
```

---

## 📚 المزيد من المعلومات

- 📄 **التوثيق الكامل**: `docs/NAVIGATION_BUTTONS_COMPONENT.md`
- 💻 **مثال عملي**: `frontend/src/examples/NavigationButtonsUsage.jsx`
- 🎨 **الأنماط**: `frontend/src/components/auth/NavigationButtons.css`

---

## 🎉 جاهز!

الآن يمكنك استخدام NavigationButtons في نماذجك متعددة الخطوات!

```jsx
import NavigationButtons from '../components/auth/NavigationButtons';

<NavigationButtons
  currentStep={currentStep}
  totalSteps={4}
  onNext={() => setCurrentStep(prev => prev + 1)}
  onPrevious={() => setCurrentStep(prev => prev - 1)}
  onSkip={() => setCurrentStep(prev => prev + 1)}
  isNextDisabled={!isValid}
  isLoading={isSubmitting}
  isOptionalStep={currentStep === 4}
  language="ar"
/>
```

---

**تاريخ الإنشاء**: 2026-02-23  
**الوقت المتوقع للإعداد**: 5 دقائق  
**الحالة**: ✅ جاهز للاستخدام
