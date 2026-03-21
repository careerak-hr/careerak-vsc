# NotificationsTab Component

## Overview
مكون NotificationsTab يوفر واجهة شاملة لإدارة تفضيلات الإشعارات للمستخدمين في منصة Careerak.

## Features
- ✅ 5 أنواع من الإشعارات (وظائف، دورات، محادثات، تقييمات، نظام)
- ✅ 3 طرق للإشعار (داخل التطبيق، البريد الإلكتروني، Push)
- ✅ ساعات الهدوء (Quiet Hours) مع تحديد وقت البداية والنهاية
- ✅ 3 خيارات لتكرار الإشعارات (فوري، ملخص يومي، ملخص أسبوعي)
- ✅ دعم متعدد اللغات (العربية، الإنجليزية، الفرنسية)
- ✅ تصميم متجاوب (Desktop, Tablet, Mobile)
- ✅ Dark Mode Support
- ✅ RTL Support
- ✅ Accessibility كامل

## Usage

```jsx
import NotificationsTab from './pages/SettingsPage/NotificationsTab';

function SettingsPage() {
  return (
    <div>
      <NotificationsTab />
    </div>
  );
}
```

## API Integration

### GET /api/settings/notifications
يحمل تفضيلات الإشعارات الحالية للمستخدم.

**Response:**
```json
{
  "preferences": {
    "jobNotifications": {
      "enabled": true,
      "inApp": true,
      "email": true,
      "push": false
    },
    "courseNotifications": { ... },
    "chatNotifications": { ... },
    "reviewNotifications": { ... },
    "systemNotifications": { ... },
    "quietHours": {
      "enabled": false,
      "start": "22:00",
      "end": "08:00"
    },
    "frequency": "immediate"
  }
}
```

### PUT /api/settings/notifications
يحفظ تفضيلات الإشعارات المحدثة.

**Request:**
```json
{
  "preferences": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings saved successfully"
}
```

## Component Structure

```
NotificationsTab/
├── NotificationsTab.jsx       # المكون الرئيسي
├── NotificationsTab.css       # التنسيقات
└── NotificationsTab.README.md # التوثيق
```

## State Management

```javascript
const [preferences, setPreferences] = useState({
  jobNotifications: { enabled, inApp, email, push },
  courseNotifications: { enabled, inApp, email, push },
  chatNotifications: { enabled, inApp, email, push },
  reviewNotifications: { enabled, inApp, email, push },
  systemNotifications: { enabled, inApp, email, push },
  quietHours: { enabled, start, end },
  frequency: 'immediate' | 'daily' | 'weekly'
});
```

## Notification Types

| النوع | الأيقونة | الوصف |
|------|---------|-------|
| Job Notifications | 💼 | إشعارات الوظائف المناسبة |
| Course Notifications | 📚 | إشعارات الدورات الجديدة |
| Chat Notifications | 💬 | إشعارات الرسائل |
| Review Notifications | ⭐ | إشعارات التقييمات |
| System Notifications | 🔔 | إشعارات النظام |

## Notification Methods

| الطريقة | الوصف |
|---------|-------|
| In-App | إشعارات داخل التطبيق |
| Email | إشعارات عبر البريد الإلكتروني |
| Push | إشعارات الدفع (Push Notifications) |

## Quiet Hours
- تمكين/تعطيل ساعات الهدوء
- تحديد وقت البداية (مثال: 22:00)
- تحديد وقت النهاية (مثال: 08:00)
- لن يتم إرسال إشعارات خلال هذه الفترة

## Frequency Options

| الخيار | الأيقونة | الوصف |
|--------|---------|-------|
| Immediate | ⚡ | إرسال الإشعارات فوراً |
| Daily Digest | 📅 | ملخص يومي للإشعارات |
| Weekly Digest | 📆 | ملخص أسبوعي للإشعارات |

## Testing

```bash
npm test -- NotificationsTab.test.jsx --run
```

### Test Coverage
- ✅ Rendering (5 tests)
- ✅ Loading Preferences (2 tests)
- ✅ Toggling Notification Types (3 tests)
- ✅ Notification Methods (1 test)
- ✅ Quiet Hours (4 tests)
- ✅ Frequency Options (3 tests)
- ✅ Saving Preferences (3 tests)
- ✅ Multi-language Support (2 tests)
- ✅ Accessibility (3 tests)

**Total: 26 tests**

## Styling

### Colors
- Primary: #304B60 (كحلي)
- Secondary: #E3DAD1 (بيج)
- Accent: #D48161 (نحاسي)
- Success: #4CAF50 (أخضر)
- Error: #f44336 (أحمر)

### Fonts
- Arabic: Amiri
- English: Cormorant Garamond
- French: EB Garamond

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1023px
- Desktop: >= 1024px

## Accessibility

- ✅ جميع toggles لها aria-labels
- ✅ time inputs لها labels مرتبطة
- ✅ radio buttons مجمعة بشكل صحيح
- ✅ focus styles واضحة
- ✅ keyboard navigation كامل
- ✅ screen reader support

## Browser Support

- ✅ Chrome (Desktop + Mobile)
- ✅ Safari (Desktop + iOS)
- ✅ Firefox (Desktop + Mobile)
- ✅ Edge
- ✅ Samsung Internet
- ✅ Opera

## Requirements Validation

### Requirement 7.1-7.6 ✅
- ✅ 7.1: toggles لأنواع الإشعارات (5 أنواع)
- ✅ 7.2: خيارات طريقة الإشعار (In-App, Email, Push)
- ✅ 7.3: إعداد ساعات الهدوء (start time, end time)
- ✅ 7.4: خيارات تكرار الإشعارات (Immediate, Daily, Weekly)
- ✅ 7.5: Quiet Hours تمنع الإشعارات خلال الفترة المحددة
- ✅ 7.6: حفظ التفضيلات فوراً عند التغيير

## Notes

- المكون يستخدم AppContext للحصول على اللغة الحالية
- جميع النصوص مترجمة إلى 3 لغات
- التصميم متجاوب على جميع الأجهزة
- يدعم Dark Mode و RTL
- جميع الاختبارات نجحت (26/26 ✅)

## Future Enhancements

- [ ] إضافة معاينة للإشعارات
- [ ] إضافة إحصائيات الإشعارات
- [ ] إضافة تصفية الإشعارات حسب الأولوية
- [ ] إضافة جدولة الإشعارات
- [ ] إضافة قوالب الإشعارات المخصصة

## Related Files

- `backend/src/controllers/notificationController.js` - API endpoints
- `backend/src/services/notificationService.js` - Business logic
- `backend/src/models/NotificationPreference.js` - Data model
- `frontend/src/__tests__/NotificationsTab.test.jsx` - Unit tests

## Last Updated
2026-03-09
