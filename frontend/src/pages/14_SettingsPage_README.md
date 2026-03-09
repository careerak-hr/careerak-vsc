# SettingsPage Component - Documentation

## Overview

مكون صفحة الإعدادات المحسّن مع نظام تبويبات كامل (5 tabs) وإدارة حالة متقدمة.

## Features

### ✅ Implemented (Task 17)

1. **Tab Navigation (5 tabs)**
   - Account (الحساب)
   - Privacy (الخصوصية)
   - Notifications (الإشعارات)
   - Security (الأمان)
   - Data & Privacy (البيانات)

2. **State Management**
   - `activeTab`: التبويب النشط حالياً
   - `unsavedChanges`: تتبع التغييرات غير المحفوظة
   - `undoStack`: مكدس التراجع (للاستخدام المستقبلي)

3. **Last Tab Persistence**
   - حفظ آخر تبويب تمت زيارته في localStorage
   - استرجاع آخر تبويب عند العودة للصفحة

4. **RTL/LTR Support**
   - دعم كامل للعربية (RTL)
   - دعم الإنجليزية والفرنسية (LTR)

5. **Multi-language Support**
   - العربية (ar)
   - English (en)
   - Français (fr)

## File Structure

```
frontend/src/pages/
├── 14_SettingsPage_Enhanced.jsx      # المكون الرئيسي
├── 14_SettingsPage_Enhanced.css      # التنسيقات
└── 14_SettingsPage_README.md         # هذا الملف

frontend/src/__tests__/
└── SettingsPage.test.jsx              # اختبارات Unit Tests (15 tests)
```

## Usage

```jsx
import SettingsPage from './pages/14_SettingsPage_Enhanced';

// في AppRoutes.jsx
<Route path="/settings" element={<SettingsPage />} />
```

## Props

لا يوجد props - المكون يستخدم Context APIs:
- `AppContext`: للغة والوظائف العامة
- `ThemeContext`: للوضع الداكن/الفاتح

## State Management

### activeTab
```javascript
const [activeTab, setActiveTab] = useState('account');
```
- القيم الممكنة: 'account', 'privacy', 'notifications', 'security', 'data'
- يتم حفظه في localStorage تلقائياً

### unsavedChanges
```javascript
const [unsavedChanges, setUnsavedChanges] = useState(false);
```
- يتم تفعيله عند تعديل أي إعداد
- يعرض تحذير عند محاولة تغيير التبويب

### undoStack
```javascript
const [undoStack, setUndoStack] = useState([]);
```
- للاستخدام المستقبلي في ميزة التراجع
- سيتم تنفيذه في المهام القادمة

## Tab Components (Placeholders)

المكونات التالية placeholders وسيتم تنفيذها في المهام القادمة:

1. **AccountTab** (Task 18)
   - تعديل الملف الشخصي
   - تغيير البريد الإلكتروني
   - تغيير رقم الهاتف
   - تغيير كلمة المرور

2. **PrivacyTab** (Task 19)
   - إعدادات رؤية الملف الشخصي
   - إعدادات الخصوصية

3. **NotificationsTab** (Task 20)
   - تفضيلات الإشعارات
   - ساعات الهدوء

4. **SecurityTab** (Task 21)
   - المصادقة الثنائية (2FA)
   - إدارة الجلسات
   - سجل تسجيل الدخول

5. **DataTab** (Task 22)
   - تصدير البيانات
   - حذف الحساب

## Accessibility

### ARIA Attributes
- `role="tablist"` على nav
- `role="tab"` على كل زر تبويب
- `role="tabpanel"` على محتوى التبويب
- `aria-selected` للتبويب النشط
- `aria-controls` و `aria-labelledby` للربط

### Keyboard Navigation
- Tab: التنقل بين التبويبات
- Enter/Space: تفعيل التبويب
- Arrow keys: (سيتم إضافتها في تحسينات مستقبلية)

### Screen Reader Support
- تسميات واضحة لجميع العناصر
- إعلانات للتغييرات (aria-live)
- دعم كامل للقراء الشاشة

## Responsive Design

### Desktop (>= 1024px)
- عرض كامل للتبويبات مع الأيقونات والنصوص
- محتوى واسع

### Tablet (640px - 1023px)
- تبويبات متوسطة الحجم
- محتوى متوسط

### Mobile (< 640px)
- عرض الأيقونات فقط (إخفاء النصوص)
- تبويبات صغيرة
- محتوى مضغوط

## Dark Mode Support

جميع العناصر تدعم الوضع الداكن:
- خلفيات
- نصوص
- حدود
- تبويبات

## Testing

### Unit Tests (15 tests)

```bash
npm test -- SettingsPage.test.jsx
```

**Test Coverage:**
1. Display 5 main tabs ✅
2. Display tabs with correct icons ✅
3. Display tabs in Arabic ✅
4. Display tabs in French ✅
5. Highlight active tab ✅
6. Switch tabs when clicked ✅
7. Display corresponding content ✅
8. Navigate through all tabs ✅
9. Save active tab to localStorage ✅
10. Load last visited tab ✅
11. Default to account tab ✅
12. Ignore invalid tab id ✅
13. RTL support for Arabic ✅
14. LTR support for English/French ✅
15. Accessibility attributes ✅

## Browser Support

- ✅ Chrome (Desktop + Mobile)
- ✅ Safari (Desktop + iOS)
- ✅ Firefox (Desktop + Mobile)
- ✅ Edge
- ✅ Samsung Internet

## Performance

- Lazy loading للمحتوى (سيتم تحسينه)
- Memoization للمكونات الفرعية (سيتم إضافته)
- Optimized re-renders

## Next Steps

### Task 18: AccountTab Component
- تنفيذ نموذج تعديل الملف الشخصي
- تنفيذ EmailChangeModal
- تنفيذ PhoneChangeModal
- تنفيذ PasswordChangeModal

### Task 19: PrivacyTab Component
- تنفيذ خيارات رؤية الملف الشخصي
- تنفيذ إعدادات الخصوصية

### Task 20: NotificationsTab Component
- تنفيذ toggles لأنواع الإشعارات
- تنفيذ إعداد ساعات الهدوء

### Task 21: SecurityTab Component
- تنفيذ Enable2FAModal
- تنفيذ ActiveSessionsList
- تنفيذ LoginHistoryList

### Task 22: DataTab Component
- تنفيذ DataExportSection
- تنفيذ AccountDeletionSection

## Notes

- المكون يستخدم localStorage للحفظ المحلي
- جميع النصوص قابلة للترجمة
- التصميم يتبع معايير المشروع (Amiri, Cormorant Garamond)
- الألوان من palette المشروع (#304B60, #E3DAD1, #D48161)

## Troubleshooting

### التبويبات لا تظهر
- تحقق من استيراد ملف CSS
- تحقق من Context Providers

### localStorage لا يعمل
- تحقق من إعدادات المتصفح
- تحقق من وضع التصفح الخاص

### RTL لا يعمل
- تحقق من قيمة language في AppContext
- تحقق من dir attribute في HTML

## License

هذا المكون جزء من مشروع Careerak.

---

**Last Updated:** 2026-03-07  
**Version:** 1.0.0  
**Status:** ✅ Task 17 Complete
