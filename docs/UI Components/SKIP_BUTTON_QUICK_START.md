# زر "تخطي" - دليل البدء السريع ⚡

## 🎯 ما هو زر "تخطي"؟

زر يسمح للمستخدمين بتخطي الخطوات الاختيارية في نموذج التسجيل.

---

## 🚀 الاستخدام السريع (دقيقتان)

### 1. استيراد المكون

```jsx
import NavigationButtons from '../components/auth/NavigationButtons';
```

### 2. إضافة الحالة

```jsx
const [currentStep, setCurrentStep] = useState(1);
```

### 3. تعريف دالة التخطي

```jsx
const handleSkip = () => {
  if (currentStep === 4) { // الخطوة الاختيارية
    // الانتقال للخطوة التالية أو إكمال التسجيل
    handleNext();
  }
};
```

### 4. استخدام المكون

```jsx
<NavigationButtons
  currentStep={currentStep}
  totalSteps={4}
  onNext={handleNext}
  onPrevious={handlePrevious}
  onSkip={handleSkip}              // ✅ دالة التخطي
  isOptionalStep={currentStep === 4} // ✅ الخطوة 4 اختيارية
  language="ar"
/>
```

---

## ✅ متى يظهر زر "تخطي"؟

```javascript
// الشرط
const showSkipButton = isOptionalStep && !isLastStep;

// مثال
currentStep = 4
totalSteps = 5
isOptionalStep = true
→ زر "تخطي" يظهر ✅

currentStep = 4
totalSteps = 4
isOptionalStep = true
→ زر "تخطي" لا يظهر ❌ (الخطوة الأخيرة)
```

---

## 🎨 التخصيص

### تغيير النص

```jsx
const translations = {
  ar: { skip: 'تخطي' },
  en: { skip: 'Skip' },
  fr: { skip: 'Passer' }
};
```

### تغيير الألوان

```css
.navigation-btn-skip {
  background-color: transparent;
  color: #6B7280;
  border-color: #D1D5DB;
}
```

---

## 🧪 الاختبار السريع

```bash
# 1. افتح المثال
http://localhost:5173/examples/navigation-buttons-usage

# 2. انتقل للخطوة 4

# 3. تحقق من:
✅ زر "تخطي" يظهر
✅ زر "تخطي" يعمل عند النقر
✅ يمكن إكمال النموذج بدون ملء الحقول الاختيارية
```

---

## 🐛 حل المشاكل السريع

| المشكلة | الحل |
|---------|------|
| زر "تخطي" لا يظهر | تحقق من `isOptionalStep={true}` |
| زر "تخطي" لا يعمل | تحقق من تعريف `onSkip` |
| زر "تخطي" معطل | تحقق من `isLoading={false}` |

---

## 📚 المزيد من المعلومات

- [دليل التنفيذ الكامل](./SKIP_BUTTON_IMPLEMENTATION.md)
- [مثال الاستخدام](../frontend/src/examples/NavigationButtonsUsage.jsx)
- [المكون الأصلي](../frontend/src/components/auth/NavigationButtons.jsx)

---

**⏱️ الوقت المقدر**: دقيقتان  
**🎯 الصعوبة**: سهل  
**✅ الحالة**: جاهز للاستخدام
