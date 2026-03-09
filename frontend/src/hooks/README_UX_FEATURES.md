# UX Features - دليل الاستخدام

## نظرة عامة

هذا الدليل يشرح كيفية استخدام ميزات UX المحسّنة في صفحة الإعدادات:
- **Auto-Save System**: حفظ تلقائي بعد فترة من عدم النشاط
- **Undo System**: التراجع عن آخر 5 تغييرات خلال 30 ثانية
- **Confirmation Dialogs**: تأكيدات للإجراءات الحساسة

## المتطلبات المحققة

- ✅ **Requirement 13.1**: حفظ تلقائي بعد ثانيتين من عدم النشاط
- ✅ **Requirement 13.2**: عرض مؤشر نجاح الحفظ
- ✅ **Requirement 13.3**: معالجة الأخطاء مع رسائل واضحة
- ✅ **Requirement 13.5**: خيار التراجع عن آخر 5 تغييرات خلال 30 ثانية
- ✅ **Requirement 13.6**: تأكيد صريح للإجراءات الحساسة

---

## 1. Auto-Save System

### useAutoSave Hook

```javascript
import useAutoSave from '../hooks/useAutoSave';

const { isSaving, lastSaved, error, triggerSave, cancelAutoSave, forceSave } = useAutoSave(
  saveFunction,  // Function to call when saving
  2000          // Delay in milliseconds (default: 2000ms)
);
```

#### Parameters
- `saveFunction`: دالة async تُستدعى عند الحفظ (يجب أن ترجع Promise)
- `delay`: التأخير بالميلي ثانية قبل الحفظ التلقائي (افتراضي: 2000ms)

#### Returns
- `isSaving`: boolean - هل يتم الحفظ حالياً
- `lastSaved`: Date | null - آخر وقت حفظ ناجح
- `error`: string | null - رسالة الخطأ إن وجدت
- `triggerSave(data)`: دالة لتفعيل الحفظ التلقائي
- `cancelAutoSave()`: دالة لإلغاء الحفظ المعلق
- `forceSave(data)`: دالة للحفظ الفوري (تتجاوز التأخير)

#### مثال الاستخدام

```javascript
function ProfileSettings() {
  const [profile, setProfile] = useState({ name: '', email: '' });

  const saveProfile = async (data) => {
    const response = await fetch('/api/settings/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('فشل الحفظ');
    }
  };

  const { isSaving, lastSaved, error, triggerSave } = useAutoSave(saveProfile, 2000);

  const handleChange = (field, value) => {
    const newProfile = { ...profile, [field]: value };
    setProfile(newProfile);
    triggerSave(newProfile); // سيحفظ بعد ثانيتين من آخر تغيير
  };

  return (
    <div>
      <input 
        value={profile.name}
        onChange={(e) => handleChange('name', e.target.value)}
      />
      <AutoSaveIndicator 
        isSaving={isSaving}
        lastSaved={lastSaved}
        error={error}
      />
    </div>
  );
}
```

### AutoSaveIndicator Component

```javascript
import AutoSaveIndicator from '../components/Settings/AutoSaveIndicator';

<AutoSaveIndicator 
  isSaving={isSaving}
  lastSaved={lastSaved}
  error={error}
/>
```

#### الحالات المعروضة
- **Saving**: "جاري الحفظ..." مع spinner
- **Success**: "تم الحفظ منذ X" مع أيقونة ✓ (يظهر لمدة 3 ثواني)
- **Error**: رسالة الخطأ مع أيقونة ⚠️

---

## 2. Undo System

### useUndoStack Hook

```javascript
import useUndoStack from '../hooks/useUndoStack';

const { canUndo, undo, pushChange, clearStack, undoStack, getTimeRemaining } = useUndoStack(
  5,      // maxSize: عدد التغييرات المحفوظة (افتراضي: 5)
  30000   // expiryTime: مدة الصلاحية بالميلي ثانية (افتراضي: 30000ms)
);
```

#### Parameters
- `maxSize`: الحد الأقصى لعدد التغييرات المحفوظة (افتراضي: 5)
- `expiryTime`: الوقت بالميلي ثانية قبل انتهاء صلاحية التغيير (افتراضي: 30000ms)

#### Returns
- `canUndo`: boolean - هل يمكن التراجع
- `undo()`: دالة async للتراجع عن آخر تغيير
- `pushChange(change)`: دالة لإضافة تغيير جديد
- `clearStack()`: دالة لمسح جميع التغييرات
- `undoStack`: array - قائمة التغييرات الحالية
- `getTimeRemaining()`: دالة للحصول على الوقت المتبقي لآخر تغيير

#### مثال الاستخدام

```javascript
function SettingsForm() {
  const [settings, setSettings] = useState({ theme: 'light', language: 'ar' });
  const { canUndo, undo, pushChange, getTimeRemaining } = useUndoStack(5, 30000);

  const handleChange = (field, value) => {
    const oldValue = settings[field];
    const newSettings = { ...settings, [field]: value };

    // حفظ التغيير في undo stack
    pushChange({
      data: { field, oldValue, newValue: value },
      revertFunction: async ({ field, oldValue }) => {
        setSettings(prev => ({ ...prev, [field]: oldValue }));
      },
      description: `تغيير ${field}`
    });

    setSettings(newSettings);
  };

  const handleUndo = async () => {
    try {
      await undo();
      console.log('تم التراجع بنجاح');
    } catch (error) {
      console.error('فشل التراجع:', error.message);
    }
  };

  return (
    <div>
      <select 
        value={settings.theme}
        onChange={(e) => handleChange('theme', e.target.value)}
      >
        <option value="light">فاتح</option>
        <option value="dark">داكن</option>
      </select>

      {canUndo && (
        <UndoButton
          canUndo={canUndo}
          onUndo={handleUndo}
          getTimeRemaining={getTimeRemaining}
        />
      )}
    </div>
  );
}
```

### UndoButton Component

```javascript
import UndoButton from '../components/Settings/UndoButton';

<UndoButton
  canUndo={canUndo}
  onUndo={handleUndo}
  getTimeRemaining={getTimeRemaining}
  lastChangeDescription="تغيير الثيم"
/>
```

### UndoNotification Component

```javascript
import UndoNotification from '../components/Settings/UndoNotification';

<UndoNotification
  show={showNotification}
  message="تم التراجع عن التغيير"
  type="success"  // 'success' | 'error' | 'info'
  duration={3000}
  onClose={() => setShowNotification(false)}
/>
```

---

## 3. Confirmation Dialogs

### ConfirmationModal Component

```javascript
import ConfirmationModal from '../components/Settings/ConfirmationModal';

<ConfirmationModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onConfirm={handleConfirm}
  title="تأكيد الحذف"
  message="هل أنت متأكد من رغبتك في حذف هذا العنصر؟"
  confirmText="حذف"
  cancelText="إلغاء"
  variant="danger"  // 'danger' | 'warning' | 'info'
  requiresTyping={false}
  confirmationText="حذف"
/>
```

#### Props
- `isOpen`: boolean - هل النافذة مفتوحة
- `onClose`: function - دالة الإغلاق
- `onConfirm`: async function - دالة التأكيد
- `title`: string - عنوان النافذة
- `message`: string - رسالة التأكيد
- `confirmText`: string - نص زر التأكيد (افتراضي: "تأكيد")
- `cancelText`: string - نص زر الإلغاء (افتراضي: "إلغاء")
- `variant`: 'danger' | 'warning' | 'info' - نوع النافذة (افتراضي: 'warning')
- `requiresTyping`: boolean - هل يتطلب كتابة نص التأكيد (افتراضي: false)
- `confirmationText`: string - النص المطلوب كتابته (افتراضي: "تأكيد")
- `children`: ReactNode - محتوى إضافي

#### مثال الاستخدام - حذف حساب

```javascript
function AccountSettings() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAccount = async () => {
    await fetch('/api/settings/account/delete', { method: 'POST' });
    console.log('تم حذف الحساب');
  };

  return (
    <div>
      <button onClick={() => setShowDeleteModal(true)}>
        حذف الحساب
      </button>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="تأكيد حذف الحساب"
        message="هل أنت متأكد من رغبتك في حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه."
        confirmText="حذف الحساب"
        cancelText="إلغاء"
        variant="danger"
        requiresTyping={true}
        confirmationText="حذف"
      >
        <div>
          <p>سيتم حذف:</p>
          <ul>
            <li>جميع بياناتك الشخصية</li>
            <li>جميع طلبات التوظيف</li>
            <li>جميع الرسائل</li>
          </ul>
        </div>
      </ConfirmationModal>
    </div>
  );
}
```

---

## Property-Based Tests

تم كتابة اختبارات property-based شاملة للتحقق من:

### Property 25: Auto-Save Timing
- ✅ الحفظ يحدث بعد التأخير المحدد بالضبط
- ✅ إلغاء الحفظ إذا حدث تغيير جديد قبل انتهاء التأخير
- ✅ تحديث lastSaved بعد الحفظ الناجح

### Property 26: Undo Stack Management
- ✅ الحفاظ على حد أقصى maxSize من التغييرات
- ✅ انتهاء صلاحية التغييرات بعد expiryTime
- ✅ التراجع بترتيب LIFO (آخر دخول، أول خروج)
- ✅ رفض التراجع إذا انتهت صلاحية التغيير
- ✅ مسح جميع التغييرات عند استدعاء clearStack

### Property 27: Sensitive Action Confirmation
- ✅ طلب تأكيد صريح للإجراءات الحساسة
- ✅ منع التأكيد أثناء التنفيذ

### تشغيل الاختبارات

```bash
cd frontend
npm test -- uxFeatures.property.test.js
```

---

## أفضل الممارسات

### Auto-Save
1. ✅ استخدم تأخير 2 ثانية (2000ms) للتوازن بين الأداء وتجربة المستخدم
2. ✅ اعرض مؤشر الحفظ دائماً
3. ✅ تعامل مع الأخطاء بشكل واضح
4. ✅ استخدم forceSave للحفظ الفوري عند الحاجة (مثل إغلاق النافذة)

### Undo
1. ✅ احفظ فقط التغييرات المهمة (ليس كل ضغطة مفتاح)
2. ✅ استخدم وصف واضح لكل تغيير
3. ✅ اعرض الوقت المتبقي للمستخدم
4. ✅ امسح undo stack بعد الحفظ الناجح إذا لزم الأمر

### Confirmation
1. ✅ استخدم variant="danger" للإجراءات الخطيرة (حذف، إنهاء)
2. ✅ استخدم requiresTyping للإجراءات الحساسة جداً
3. ✅ اكتب رسائل واضحة ومحددة
4. ✅ أضف محتوى إضافي (children) لتوضيح العواقب

---

## الدعم

- 🌍 دعم RTL/LTR كامل
- 🌙 دعم Dark Mode
- 📱 تصميم متجاوب (Desktop, Tablet, Mobile)
- ♿ Accessibility كامل (ARIA labels, keyboard navigation)
- 🎨 متوافق مع ألوان المشروع (#304B60, #E3DAD1, #D48161)

---

## مثال شامل

راجع `frontend/src/examples/UXFeaturesExample.jsx` لمثال كامل يجمع جميع الميزات.

```bash
# تشغيل المثال
npm start
# ثم افتح http://localhost:3000/examples/ux-features
```
