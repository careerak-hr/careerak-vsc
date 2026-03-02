# User Management Quick Start Guide

دليل البدء السريع لنظام إدارة المستخدمين المحسّن

## التثبيت

لا يحتاج تثبيت إضافي - النظام مدمج بالفعل في Backend.

## الاستخدام السريع

### 1. البحث عن مستخدم

```bash
# البحث بالاسم
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:5000/api/admin/users/search?q=john"

# البحث بالبريد الإلكتروني
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:5000/api/admin/users/search?q=john@example.com"
```

### 2. تصفية المستخدمين

```bash
# تصفية الموظفين في مصر
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:5000/api/admin/users?type=Employee&country=Egypt"

# تصفية المستخدمين المحققين
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:5000/api/admin/users?isVerified=true"
```

### 3. تعطيل حساب

```bash
curl -X PATCH \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Violation of terms"}' \
  "http://localhost:5000/api/admin/users/USER_ID/disable"
```

### 4. تفعيل حساب

```bash
curl -X PATCH \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:5000/api/admin/users/USER_ID/enable"
```

### 5. حذف حساب

```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"User requested deletion"}' \
  "http://localhost:5000/api/admin/users/USER_ID"
```

### 6. جلب سجل النشاطات

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:5000/api/admin/users/USER_ID/activity"
```

## استخدام في Frontend

### React Example

```jsx
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // البحث
  const searchUsers = async () => {
    const response = await axios.get(
      `/api/admin/users/search?q=${searchQuery}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    setUsers(response.data.users);
  };

  // تعطيل حساب
  const disableUser = async (userId, reason) => {
    await axios.patch(
      `/api/admin/users/${userId}/disable`,
      { reason },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    alert('تم تعطيل الحساب بنجاح');
  };

  // تفعيل حساب
  const enableUser = async (userId) => {
    await axios.patch(
      `/api/admin/users/${userId}/enable`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    alert('تم تفعيل الحساب بنجاح');
  };

  // حذف حساب
  const deleteUser = async (userId, reason) => {
    if (confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
      await axios.delete(
        `/api/admin/users/${userId}`,
        {
          data: { reason },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert('تم حذف الحساب بنجاح');
    }
  };

  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="ابحث عن مستخدم..."
      />
      <button onClick={searchUsers}>بحث</button>

      <table>
        <thead>
          <tr>
            <th>الاسم</th>
            <th>البريد</th>
            <th>النوع</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.userType}</td>
              <td>
                {user.accountDisabled ? (
                  <button onClick={() => enableUser(user._id)}>
                    تفعيل
                  </button>
                ) : (
                  <button onClick={() => disableUser(user._id, 'سبب التعطيل')}>
                    تعطيل
                  </button>
                )}
                <button onClick={() => deleteUser(user._id, 'سبب الحذف')}>
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## الاختبار

```bash
cd backend

# اختبار سريع
npm test -- user-management.unit.test.js

# جميع الاختبارات
npm test
```

## استكشاف الأخطاء

### "Authentication required"
- تأكد من إرسال token صحيح في header
- تأكد من أن token لم ينتهِ

### "Insufficient permissions"
- تأكد من أن المستخدم لديه role: 'Admin'

### "User not found"
- تحقق من صحة userId
- تأكد من أن المستخدم موجود في قاعدة البيانات

### "Account is already disabled"
- المستخدم معطل بالفعل
- استخدم enable endpoint بدلاً من ذلك

## الموارد

- 📄 [التوثيق الكامل](./USER_MANAGEMENT_IMPLEMENTATION.md)
- 📄 [Requirements](../.kiro/specs/admin-dashboard-enhancements/requirements.md)
- 📄 [Design](../.kiro/specs/admin-dashboard-enhancements/design.md)

---

**ملاحظة**: جميع endpoints تتطلب صلاحيات Admin
