# UX Features - دليل البدء السريع

**الوقت المتوقع**: 5 دقائق

---

## 🚀 البدء السريع

### 1. Auto-Save (حفظ تلقائي)

```javascript
import useAutoSave from '../hooks/useAutoSave';
import AutoSaveIndicator from '../components/Settings/AutoSaveIndicator';

function MyForm() {
  const [data, setData] = useState({});
  
  const { isSaving, lastSaved, error, triggerSave } = useAutoSave(
    async (data) => {
      await fetch('/api/save', { 
        method: 'POST', 
        body: JSON.stringify(data) 
      });
    },
    2000 // حفظ بعد ثانيتين
  );

  const handleChange = (value) => {
    setData(value);
    triggerSave(value); // سيحفظ بعد ثانيتين من آخر تغيير
  };

  return (
    <div>
      <input onChange={(e) => handleChange(e.target.value)} />
      <AutoSaveIndicator 
        isSaving={isSaving} 
        lastSaved={lastSaved} 
        error={error} 
      />
    </div>
  );
}
```

---

### 2. Undo (التراجع)

```javascript
import useUndoStack from '../hooks/useUndoStack';
import UndoButton from '../components/Settings/UndoButton';

function MyForm() {
  const [value, setValue] = useState('');
  const { canUndo, undo, pushChange, getTimeRemaining } = useUndoStack(5, 30000);

  const handleChange = (newValue) => {
    const oldValue = value;
    
    pushChange({
      data: { oldValue, newValue },
      revertFunction: async ({ oldValue }) => {
        setValue(oldValue);
      },
      description: 'تغيير القيمة'
    });

    setValue(newValue);
  };

  return (
    <div>
      <input value={value} onChange={(e) => handleChange(e.target.value)} />
      {canUndo && (
        <UndoButton
          canUndo={canUndo}
          onUndo={undo}
          getTimeRemaining={getTimeRemaining}
        />
      )}
    </div>
  );
}
```

---

### 3. Confirmation (التأكيد)

```javascript
import { useState } from 'react';
import ConfirmationModal from '../components/Settings/ConfirmationModal';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    await fetch('/api/delete', { method: 'DELETE' });
    console.log('تم الحذف');
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)}>حذف</button>

      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد؟"
        confirmText="حذف"
        variant="danger"
        requiresTyping={true}
        confirmationText="حذف"
      />
    </div>
  );
}
```

---

## 📦 التثبيت

```bash
cd frontend
npm install fast-check --save-dev
```

---

## 🧪 الاختبار

```bash
npm test -- uxFeatures.property.test.js
```

---

## 📚 التوثيق الكامل

راجع `frontend/src/hooks/README_UX_FEATURES.md` للتوثيق الشامل.

---

## 🎯 الميزات الرئيسية

- ✅ حفظ تلقائي بعد ثانيتين
- ✅ التراجع عن آخر 5 تغييرات (30 ثانية)
- ✅ تأكيدات للإجراءات الحساسة
- ✅ مؤشرات بصرية واضحة
- ✅ معالجة أخطاء شاملة
- ✅ RTL/LTR + Dark Mode
- ✅ Responsive + Accessible

---

## 🔗 روابط مفيدة

- [التقرير الشامل](./UX_FEATURES_IMPLEMENTATION_REPORT.md)
- [التوثيق الكامل](../../frontend/src/hooks/README_UX_FEATURES.md)
- [مثال تفاعلي](../../frontend/src/examples/UXFeaturesExample.jsx)
- [الاختبارات](../../frontend/src/tests/uxFeatures.property.test.js)
