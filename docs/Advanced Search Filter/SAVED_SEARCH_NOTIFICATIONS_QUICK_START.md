# دليل البدء السريع - إشعارات عمليات البحث المحفوظة

## ⚡ البدء السريع (5 دقائق)

### ✅ الميزة جاهزة للاستخدام

نظام الإشعارات مفعّل تلقائياً ويعمل مع جميع عمليات البحث المحفوظة.

---

## 🎯 كيف يعمل

### 1. حفظ عملية بحث

```bash
POST /api/search/saved
Authorization: Bearer <token>

{
  "name": "وظائف مطور",
  "searchType": "jobs",
  "searchParams": { "query": "developer" }
}
```

**النتيجة**: إشعار فوري "تم حفظ البحث"

### 2. تحديث عملية بحث

```bash
PUT /api/search/saved/:id
Authorization: Bearer <token>

{
  "name": "وظائف مطور - محدث"
}
```

**النتيجة**: إشعار فوري "تم تحديث البحث"

### 3. حذف عملية بحث

```bash
DELETE /api/search/saved/:id
Authorization: Bearer <token>
```

**النتيجة**: إشعار فوري "تم حذف البحث"

---

## 🧪 الاختبار

```bash
cd backend
npm test -- savedSearch-notifications.test.js
```

**النتيجة المتوقعة**: ✅ 16/16 tests passed

---

## 📱 في Frontend

### عرض الإشعارات

```jsx
import { useNotifications } from '../hooks/useNotifications';

function NotificationBell() {
  const { notifications, unreadCount } = useNotifications();
  
  return (
    <div>
      <Badge count={unreadCount}>
        <BellIcon />
      </Badge>
      
      {notifications.map(notif => (
        <NotificationItem key={notif._id} notification={notif} />
      ))}
    </div>
  );
}
```

---

## 🔍 استكشاف الأخطاء

### الإشعارات لا تظهر؟

1. **تحقق من تفضيلات المستخدم**
   ```bash
   GET /api/notifications/preferences
   ```
   تأكد من أن `system` notifications مفعّلة

2. **تحقق من ساعات الهدوء**
   - الإشعارات قد تكون مؤجلة خلال ساعات الهدوء

3. **تحقق من السجلات**
   ```bash
   # في backend logs
   grep "Notification created" backend/logs/combined.log
   ```

---

## 📊 الإحصائيات

```bash
# عدد الإشعارات المرسلة
GET /api/notifications?type=system&limit=100

# الإشعارات غير المقروءة
GET /api/notifications/unread-count
```

---

## 🎨 التخصيص

### تغيير الأولوية

```javascript
// في savedSearchService.js
await notificationService.createNotification({
  recipient: userId,
  type: 'system',
  title: 'تم حفظ البحث',
  message: `...`,
  priority: 'high'  // بدلاً من 'medium'
});
```

### إضافة بيانات إضافية

```javascript
await notificationService.createNotification({
  recipient: userId,
  type: 'system',
  title: 'تم حفظ البحث',
  message: `...`,
  priority: 'medium',
  relatedData: {
    savedSearchId: savedSearch._id,
    searchType: savedSearch.searchType
  }
});
```

---

## 📚 المزيد من المعلومات

- [التوثيق الكامل](./SAVED_SEARCH_NOTIFICATIONS.md)
- [نظام الإشعارات](../NOTIFICATION_SYSTEM.md)
- [Design Document](../../.kiro/specs/advanced-search-filter/design.md)

---

**تاريخ الإنشاء**: 2026-03-03  
**الحالة**: ✅ جاهز للاستخدام
