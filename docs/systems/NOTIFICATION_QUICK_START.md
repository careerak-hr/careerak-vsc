# 🚀 دليل البدء السريع - نظام الإشعارات

## ⚡ البدء في 5 دقائق

### 1. التأكد من تشغيل النظام

```bash
# في مجلد backend
npm start
```

النظام جاهز! جميع الملفات المطلوبة تم إنشاؤها.

---

## 🧪 اختبار النظام

### اختبار 1: الحصول على الإشعارات

```bash
curl http://localhost:5000/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "notifications": [],
    "pagination": { "page": 1, "limit": 20, "total": 0, "pages": 0 },
    "unreadCount": 0
  }
}
```

### اختبار 2: الحصول على التفضيلات

```bash
curl http://localhost:5000/notifications/preferences \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**النتيجة المتوقعة:**
سيتم إنشاء تفضيلات افتراضية تلقائياً إذا لم تكن موجودة.

### اختبار 3: نشر وظيفة جديدة (اختبار المطابقة الذكية)

```bash
curl -X POST http://localhost:5000/jobs \
  -H "Authorization: Bearer HR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "مطور React",
    "description": "نبحث عن مطور React محترف",
    "requirements": "خبرة في React, JavaScript, Node.js",
    "location": "القاهرة",
    "jobType": "Full-time"
  }'
```

**ما سيحدث:**
- سيتم نشر الوظيفة
- النظام سيبحث عن مستخدمين لديهم مهارات React/JavaScript
- سيتم إرسال إشعارات تلقائية للمستخدمين المناسبين

### اختبار 4: التقديم على وظيفة (اختبار إشعار الشركة)

```bash
curl -X POST http://localhost:5000/applications \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobPostingId": "JOB_ID",
    "fullName": "أحمد محمد",
    "email": "ahmed@example.com",
    "phone": "01234567890"
  }'
```

**ما سيحدث:**
- سيتم تقديم الطلب
- الشركة ستحصل على إشعار فوري بطلب جديد

### اختبار 5: تحديث حالة الطلب (اختبار إشعار المتقدم)

```bash
curl -X PATCH http://localhost:5000/applications/APPLICATION_ID/status \
  -H "Authorization: Bearer HR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "status": "Accepted" }'
```

**ما سيحدث:**
- سيتم تحديث حالة الطلب
- المتقدم سيحصل على إشعار بقبول طلبه (أولوية urgent)

---

## 📱 التكامل مع Frontend

### خطوة 1: إنشاء Hook للإشعارات

```javascript
// hooks/useNotifications.js
import { useState, useEffect } from 'react';

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const token = localStorage.getItem('token');
  
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/notifications/unread-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };
  
  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/notifications?page=${page}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setNotifications(data.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const markAsRead = async (id) => {
    try {
      await fetch(`/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      await fetch('/notifications/mark-all-read', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };
  
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // كل 30 ثانية
    return () => clearInterval(interval);
  }, []);
  
  return {
    unreadCount,
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
}
```

### خطوة 2: إنشاء مكون الجرس

```jsx
// components/NotificationBell.jsx
import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, notifications, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  
  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };
  
  return (
    <div className="notification-bell">
      <button onClick={handleOpen} className="bell-button">
        🔔
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>
      
      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>الإشعارات</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-btn">
                تحديد الكل كمقروء
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {loading ? (
              <div className="loading">جاري التحميل...</div>
            ) : notifications.length === 0 ? (
              <div className="empty">لا توجد إشعارات</div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif._id} 
                  className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(notif._id)}
                >
                  <div className="notif-title">{notif.title}</div>
                  <div className="notif-message">{notif.message}</div>
                  <div className="notif-time">
                    {new Date(notif.createdAt).toLocaleString('ar-EG')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### خطوة 3: إضافة الأنماط

```css
/* styles/NotificationBell.css */
.notification-bell {
  position: relative;
}

.bell-button {
  position: relative;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
}

.bell-button .badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #D48161;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: bold;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 400px;
  max-height: 500px;
  background: white;
  border: 2px solid #304B60;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #E3DAD1;
  background: #F5F5F5;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 18px;
  color: #304B60;
}

.mark-all-btn {
  background: none;
  border: none;
  color: #D48161;
  cursor: pointer;
  font-size: 14px;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: 16px;
  border-bottom: 1px solid #E3DAD1;
  cursor: pointer;
  transition: background 0.2s;
}

.notification-item:hover {
  background: #F9F9F9;
}

.notification-item.unread {
  background: #FFF8F5;
  border-left: 4px solid #D48161;
}

.notif-title {
  font-weight: bold;
  color: #304B60;
  margin-bottom: 4px;
}

.notif-message {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.notif-time {
  color: #999;
  font-size: 12px;
}

.loading, .empty {
  padding: 32px;
  text-align: center;
  color: #999;
}
```

### خطوة 4: استخدام المكون

```jsx
// في App.jsx أو Header.jsx
import { NotificationBell } from './components/NotificationBell';

function Header() {
  return (
    <header>
      <div className="logo">Careerak</div>
      <nav>
        {/* روابط التنقل */}
      </nav>
      <NotificationBell />
    </header>
  );
}
```

---

## 🎯 السيناريوهات الشائعة

### سيناريو 1: مستخدم يبحث عن وظيفة
1. المستخدم يسجل دخوله
2. يضيف مهاراته في ملفه الشخصي (React, Node.js)
3. شركة تنشر وظيفة "مطور Full Stack - React & Node.js"
4. **النظام يرسل إشعار تلقائي للمستخدم** 🎯
5. المستخدم يرى الإشعار ويتقدم للوظيفة

### سيناريو 2: شركة تستقبل طلبات
1. الشركة تنشر وظيفة
2. مستخدم يتقدم للوظيفة
3. **الشركة تحصل على إشعار فوري** 📋
4. الشركة تراجع الطلب وتقبله
5. **المستخدم يحصل على إشعار بالقبول** 🎉

### سيناريو 3: تخصيص الإشعارات
1. المستخدم يذهب للإعدادات
2. يعطل إشعارات "job_closed"
3. يفعل البريد الإلكتروني لـ "application_accepted"
4. يضبط ساعات الهدوء من 10 مساءً إلى 8 صباحاً
5. **النظام يحترم هذه التفضيلات** ⚙️

---

## 🔧 استكشاف الأخطاء

### المشكلة: لا تظهر إشعارات
**الحل:**
1. تأكد من تسجيل الدخول (token صحيح)
2. تحقق من التفضيلات (enabled = true)
3. راجع console للأخطاء

### المشكلة: الإشعارات لا تُرسل عند نشر وظيفة
**الحل:**
1. تأكد من وجود مستخدمين بمهارات مطابقة
2. راجع logs في backend
3. تحقق من عمل `findMatchingUsersForJob`

### المشكلة: عدد الإشعارات غير المقروءة خاطئ
**الحل:**
1. امسح cache المتصفح
2. أعد تحميل الصفحة
3. تحقق من الـ database مباشرة

---

## 📚 الخطوات التالية

1. ✅ اختبر النظام باستخدام Postman
2. ✅ أضف NotificationBell للـ Frontend
3. ✅ أضف صفحة إعدادات الإشعارات
4. 🔄 فعّل Web Push Notifications (اختياري)
5. 🔄 أضف إشعارات البريد الإلكتروني (اختياري)

---

## 📖 المزيد من المعلومات

- 📄 **التوثيق الكامل**: `docs/NOTIFICATION_SYSTEM.md`
- 📄 **معايير المشروع**: `.kiro/steering/project-standards.md`

---

**نصيحة**: ابدأ بالاختبارات البسيطة أولاً، ثم انتقل للميزات المتقدمة تدريجياً!
