# بطاقة معلومات الشركة - دليل البدء السريع

## 🚀 البدء السريع (5 دقائق)

### 1. Backend Setup

**تشغيل السيرفر**:
```bash
cd backend
npm start
```

**اختبار API**:
```bash
# الحصول على معلومات شركة
curl http://localhost:5000/api/companies/[companyId]/info

# الحصول على وظائف الشركة
curl http://localhost:5000/api/companies/[companyId]/jobs
```

### 2. Frontend Setup

**تشغيل التطبيق**:
```bash
cd frontend
npm run dev
```

**استخدام المكون**:
```jsx
import CompanyCard from './components/CompanyCard/CompanyCard';

function JobDetailPage() {
  return (
    <div>
      <h1>تفاصيل الوظيفة</h1>
      
      {/* بطاقة معلومات الشركة */}
      <CompanyCard 
        companyId={job.company._id} 
        jobId={job._id} 
      />
    </div>
  );
}
```

---

## 📋 API Endpoints

### Public
```
GET  /api/companies/:id/info           # معلومات الشركة
GET  /api/companies/:id/statistics     # إحصائيات
GET  /api/companies/:id/jobs           # وظائف أخرى
```

### Protected
```
PUT  /api/companies/:id/info           # تحديث (الشركة فقط)
```

---

## 🎨 التخصيص

### تغيير الألوان
```css
/* في CompanyCard.css */
.company-card {
  background: #fff;           /* لون الخلفية */
  border: 1px solid #e0e0e0;  /* لون الإطار */
}

.btn-secondary {
  background: #D48161;         /* لون الزر الرئيسي */
}
```

### تغيير الترجمات
```javascript
// في CompanyCard.jsx
const translations = {
  ar: {
    employees: 'موظف',
    // ... باقي الترجمات
  }
};
```

---

## 🧪 الاختبار

### اختبار سريع
```bash
# 1. تشغيل Backend
cd backend && npm start

# 2. تشغيل Frontend
cd frontend && npm run dev

# 3. افتح المتصفح
# http://localhost:3000/jobs/[jobId]
```

### اختبار API
```bash
# معلومات الشركة
curl http://localhost:5000/api/companies/507f1f77bcf86cd799439011/info

# وظائف الشركة
curl http://localhost:5000/api/companies/507f1f77bcf86cd799439011/jobs?limit=5
```

---

## 🐛 استكشاف الأخطاء

### "Company not found"
```bash
# تحقق من وجود الشركة
curl http://localhost:5000/api/users/[companyId]
```

### "Cannot read property 'logo'"
```javascript
// تحقق من البيانات
console.log('Company Info:', companyInfo);
```

### الصورة لا تظهر
```javascript
// تحقق من رابط الصورة
console.log('Logo URL:', companyInfo.logo);
```

---

## 📱 التصميم المتجاوب

### Desktop
- عرض كامل
- أزرار جنباً إلى جنب

### Mobile
- عرض عمودي
- أزرار بعرض كامل

---

## 🌍 دعم اللغات

```jsx
// تغيير اللغة
const { language, setLanguage } = useApp();

// العربية
setLanguage('ar');

// الإنجليزية
setLanguage('en');

// الفرنسية
setLanguage('fr');
```

---

## ✅ Checklist

- [ ] Backend يعمل
- [ ] Frontend يعمل
- [ ] API يستجيب
- [ ] البطاقة تظهر
- [ ] الصور تحمّل
- [ ] الأزرار تعمل
- [ ] التصميم متجاوب
- [ ] اللغات تعمل

---

## 📚 المزيد من المعلومات

- 📄 [دليل التنفيذ الكامل](./COMPANY_INFO_CARD_IMPLEMENTATION.md)
- 📄 [Requirements](../.kiro/specs/enhanced-job-postings/requirements.md)
- 📄 [Design](../.kiro/specs/enhanced-job-postings/design.md)

---

**تاريخ الإنشاء**: 2026-03-06  
**الحالة**: ✅ جاهز للاستخدام
