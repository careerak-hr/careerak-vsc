# تصدير تقارير الإحالات والمكافآت

**تاريخ الإضافة**: 2026  
**الحالة**: ✅ مكتمل  
**المتطلبات**: Requirements 7.4 (تصدير تقارير PDF/Excel)

---

## الملفات الأساسية

```
backend/src/
├── services/
│   └── referralExportService.js          # خدمة التصدير
├── controllers/
│   └── referralExportController.js       # معالج الطلبات
└── routes/
    ├── referralRoutes.js                 # محدّث بـ export endpoint
    └── adminReferralExportRoutes.js      # مسارات الأدمن
```

---

## API Endpoints

### تصدير شخصي (للمستخدم)

```
GET /referrals/export?format=excel
GET /referrals/export?format=pdf
Authorization: Bearer <token>
```

**الاستجابة**: ملف Excel أو PDF مباشرة (Content-Disposition: attachment)

### تصدير إداري شامل

```
GET /admin/referrals/export?format=excel
GET /admin/referrals/export?format=pdf&startDate=2026-01-01&endDate=2026-12-31&status=completed
Authorization: Bearer <admin-token>
```

**Query Parameters الاختيارية**:
- `format`: `pdf` أو `excel` (افتراضي: `excel`)
- `startDate`: تاريخ البداية (ISO format)
- `endDate`: تاريخ النهاية (ISO format)
- `status`: `pending` | `completed` | `cancelled`

---

## محتوى التقارير

### تقرير المستخدم الشخصي

**Excel** (3 أوراق):
1. **الملخص**: إجمالي الإحالات، معدل التحويل، النقاط
2. **الإحالات**: قائمة كاملة مع الحالة والتاريخ والنقاط
3. **سجل النقاط**: جميع المعاملات (مكتسبة/مستبدلة)

**PDF** (صفحة واحدة أو أكثر):
- ملخص الإحصائيات
- قائمة الإحالات (أحدث 50)
- سجل المكافآت (آخر 20 معاملة)

### تقرير الأدمن الشامل

**Excel** (3 أوراق):
1. **الملخص**: إحصائيات البرنامج الكلية
2. **جميع الإحالات**: مع بيانات المحيل والمُحال
3. **سجل المعاملات**: أحدث 1000 معاملة

**PDF** (landscape):
- ملخص إداري شامل
- جدول الإحالات (أحدث 100)

---

## التصميم

- **ألوان المشروع**: #304B60 (كحلي)، #E3DAD1 (بيج)، #D48161 (نحاسي)
- **الخطوط**: Helvetica (متوافق مع jsPDF)
- **الاتجاه**: Portrait للتقارير الشخصية، Landscape للإدارية

---

## المكتبات المستخدمة

- `xlsx` - تصدير Excel
- `jspdf` + `jspdf-autotable` - تصدير PDF

(جميعها مثبتة مسبقاً في package.json)
