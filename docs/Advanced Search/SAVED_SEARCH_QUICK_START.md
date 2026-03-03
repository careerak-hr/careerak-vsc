# نظام حفظ عمليات البحث - دليل البدء السريع

## ⚡ البدء السريع (5 دقائق)

### 1. إنشاء عملية بحث محفوظة

```bash
curl -X POST http://localhost:5000/api/search/saved \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Developer Jobs in Cairo",
    "searchType": "jobs",
    "searchParams": {
      "query": "developer",
      "location": "Cairo",
      "salaryMin": 5000
    }
  }'
```

### 2. جلب جميع عمليات البحث

```bash
curl http://localhost:5000/api/search/saved \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. التحقق من الحد

```bash
curl http://localhost:5000/api/search/saved/check-limit \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 الحد الأقصى: 10 عمليات بحث

### كيف يعمل؟

1. **على مستوى Model**: يتحقق تلقائياً قبل الحفظ
2. **على مستوى Service**: دالة `canAddMore()` للتحقق
3. **على مستوى Controller**: يرفض الطلب مع رسالة واضحة

### رسالة الخطأ

```json
{
  "success": false,
  "error": {
    "code": "LIMIT_EXCEEDED",
    "message": "Maximum 10 saved searches allowed per user"
  }
}
```

---

## 🧪 الاختبار

```bash
cd backend
npm test savedSearch.test.js
```

**النتيجة المتوقعة**: ✅ 13/13 اختبارات نجحت

---

## 📝 الحقول المطلوبة

| الحقل | النوع | مطلوب | الوصف |
|-------|------|-------|-------|
| name | String | ✅ | اسم عملية البحث (max 100) |
| searchType | String | ✅ | 'jobs' أو 'courses' |
| searchParams | Object | ❌ | معاملات البحث |
| alertEnabled | Boolean | ❌ | تفعيل التنبيهات (افتراضي: false) |
| alertFrequency | String | ❌ | 'instant', 'daily', 'weekly' |

---

## 🔒 الأمان

- جميع endpoints محمية بـ JWT authentication
- المستخدم يمكنه فقط الوصول لعملياته الخاصة
- التحقق من الحد الأقصى على 3 مستويات

---

## 📚 التوثيق الكامل

📄 `docs/Advanced Search/SAVED_SEARCH_IMPLEMENTATION.md` - دليل شامل

---

**تاريخ الإنشاء**: 2026-03-03
