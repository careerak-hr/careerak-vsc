# دليل البدء السريع - ميزة حجم الشركة

## ⚡ 5 دقائق للبدء

---

## 📦 التصنيفات

| الحجم | عدد الموظفين | الوصف |
|-------|--------------|--------|
| **صغيرة (Small)** | < 50 | شركات ناشئة وصغيرة |
| **متوسطة (Medium)** | 50-500 | شركات متوسطة الحجم |
| **كبيرة (Large)** | > 500 | شركات كبيرة ومؤسسات |

---

## 🚀 الاستخدام السريع

### Backend - الحصول على معلومات الشركة

```bash
GET /api/companies/:id/info
```

**Response**:
```json
{
  "success": true,
  "data": {
    "size": "medium",
    "employeeCount": 150
  }
}
```

### Backend - تحديث حجم الشركة

```bash
PUT /api/companies/:id/info
Authorization: Bearer <token>

{
  "employeeCount": 200
}
```

**النتيجة**: `size` يتم تحديده تلقائياً إلى `medium`

---

### Frontend - عرض حجم الشركة

```jsx
import CompanyCard from './components/CompanyCard/CompanyCard';

<CompanyCard companyId={companyId} jobId={jobId} />
```

**النتيجة**:
```
┌─────────────────────────────┐
│ شركة التقنية المتقدمة       │
│ متوسطة • 150 موظف           │
└─────────────────────────────┘
```

---

## 🧪 الاختبار

```bash
cd backend
npm test -- companySize.test.js
```

**النتيجة المتوقعة**: ✅ 9/9 اختبارات نجحت

---

## 🎨 التخصيص

### تغيير الألوان

```css
.company-size.small { 
  background: #e3f2fd; 
  color: #1976d2; 
}

.company-size.medium { 
  background: #fff3e0; 
  color: #f57c00; 
}

.company-size.large { 
  background: #e8f5e9; 
  color: #388e3c; 
}
```

---

## 📚 التوثيق الكامل

📄 `docs/COMPANY_SIZE_FEATURE.md` - دليل شامل (500+ سطر)

---

## ✅ Checklist

- [x] النموذج يحتوي على حقل `size`
- [x] التحديد التلقائي للحجم يعمل
- [x] CompanyCard يعرض الحجم
- [x] دعم 3 لغات (ar, en, fr)
- [x] الاختبارات تنجح (9/9)

---

**تم إنشاؤه**: 2026-03-06  
**الحالة**: ✅ جاهز للاستخدام
