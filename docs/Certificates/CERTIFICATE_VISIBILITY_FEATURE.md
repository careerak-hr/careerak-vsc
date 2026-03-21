# ميزة إخفاء/إظهار الشهادات

## 📋 معلومات الميزة
- **تاريخ الإنشاء**: 2026-03-13
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 4.4 (خيار إخفاء/إظهار شهادات معينة)

---

## 🎯 نظرة عامة

ميزة كاملة تسمح للمستخدمين بإخفاء أو إظهار شهاداتهم في ملفهم الشخصي العام. الشهادات المخفية تبقى مرئية للمستخدم في لوحة التحكم الخاصة به، لكنها لا تظهر للزوار الآخرين.

---

## ✨ الميزات الرئيسية

### 1. إخفاء/إظهار الشهادات
- ✅ تبديل حالة الإخفاء بنقرة واحدة
- ✅ تحديث فوري في الواجهة
- ✅ حفظ تلقائي في قاعدة البيانات

### 2. مؤشرات بصرية
- ✅ أيقونة عين مفتوحة/مغلقة
- ✅ شارة "مخفية" على الشهادات المخفية
- ✅ تعتيم الشهادات المخفية (opacity: 0.6)

### 3. فلترة الشهادات
- ✅ عرض جميع الشهادات (مرئية + مخفية)
- ✅ عرض الشهادات المرئية فقط
- ✅ إحصائيات (عدد المرئية، عدد المخفية)

### 4. دعم متعدد اللغات
- ✅ العربية (ar)
- ✅ الإنجليزية (en)
- ✅ الفرنسية (fr)

### 5. تصميم متجاوب
- ✅ Desktop (> 1024px)
- ✅ Tablet (640px - 1023px)
- ✅ Mobile (< 640px)

---

## 🏗️ البنية التقنية

### Backend

#### 1. نموذج البيانات (Certificate Model)

```javascript
// backend/src/models/Certificate.js

const certificateSchema = new mongoose.Schema({
  // ... حقول أخرى
  
  // هل الشهادة مخفية في الملف الشخصي
  isHidden: {
    type: Boolean,
    default: false
  }
});
```

#### 2. API Endpoint

```javascript
// PATCH /api/certificates/:certificateId/visibility
// تحديث رؤية الشهادة (إخفاء/إظهار)

Request:
{
  "isHidden": true  // أو false
}

Response (Success):
{
  "success": true,
  "certificate": {
    "_id": "...",
    "certificateId": "...",
    "courseName": "...",
    "isHidden": true
  },
  "message": "Certificate visibility updated to hidden",
  "messageAr": "تم تحديث رؤية الشهادة إلى مخفية"
}

Response (Error - Not Boolean):
{
  "success": false,
  "message": "isHidden must be a boolean",
  "messageAr": "يجب أن تكون قيمة isHidden منطقية (true/false)"
}

Response (Error - Not Found):
{
  "success": false,
  "message": "Certificate not found",
  "messageAr": "الشهادة غير موجودة"
}

Response (Error - Unauthorized):
{
  "success": false,
  "message": "You are not authorized to update this certificate",
  "messageAr": "ليس لديك صلاحية لتحديث هذه الشهادة"
}
```

#### 3. الخدمة (CertificateService)

```javascript
// backend/src/services/certificateService.js

async updateCertificateVisibility(certificateId, userId, isHidden) {
  try {
    const certificate = await Certificate.findOne({ certificateId });
    
    if (!certificate) {
      return {
        success: false,
        message: 'Certificate not found',
        messageAr: 'الشهادة غير موجودة'
      };
    }
    
    // التحقق من الملكية
    if (certificate.userId.toString() !== userId.toString()) {
      return {
        success: false,
        message: 'You are not authorized to update this certificate',
        messageAr: 'ليس لديك صلاحية لتحديث هذه الشهادة'
      };
    }
    
    certificate.isHidden = isHidden;
    await certificate.save();
    
    return {
      success: true,
      certificate,
      message: `Certificate visibility updated to ${isHidden ? 'hidden' : 'visible'}`,
      messageAr: `تم تحديث رؤية الشهادة إلى ${isHidden ? 'مخفية' : 'مرئية'}`
    };
  } catch (error) {
    throw error;
  }
}
```

#### 4. المعالج (CertificateController)

```javascript
// backend/src/controllers/certificateController.js

exports.updateCertificateVisibility = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { isHidden } = req.body;
    const userId = req.user._id;
    
    // التحقق من نوع البيانات
    if (typeof isHidden !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isHidden must be a boolean',
        messageAr: 'يجب أن تكون قيمة isHidden منطقية (true/false)'
      });
    }
    
    const result = await certificateService.updateCertificateVisibility(
      certificateId,
      userId,
      isHidden
    );
    
    if (!result.success) {
      return res.status(result.message.includes('not found') ? 404 : 403).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating certificate visibility:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      messageAr: 'خطأ في الخادم'
    });
  }
};
```

#### 5. المسار (Route)

```javascript
// backend/src/routes/certificateRoutes.js

// PATCH /api/certificates/:certificateId/visibility - تحديث رؤية الشهادة
router.patch('/:certificateId/visibility', protect, certificateController.updateCertificateVisibility);
```

---

### Frontend

#### 1. مكون CertificatesGallery

```jsx
// frontend/src/components/Certificates/CertificatesGallery.jsx

const CertificatesGallery = ({ userId, isOwnProfile = false }) => {
  const [certificates, setCertificates] = useState([]);
  
  const toggleVisibility = async (certificateId, currentVisibility) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/certificates/${certificateId}/visibility`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isHidden: !currentVisibility })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update visibility');
      }
      
      // تحديث الحالة المحلية
      setCertificates(prev => prev.map(cert => 
        cert._id === certificateId 
          ? { ...cert, isHidden: !currentVisibility }
          : cert
      ));
    } catch (err) {
      console.error('Error toggling visibility:', err);
    }
  };
  
  return (
    <div className="certificates-gallery">
      {certificates.map((certificate) => (
        <div key={certificate._id} className={`certificate-card ${certificate.isHidden ? 'hidden' : ''}`}>
          {/* محتوى الشهادة */}
          
          {isOwnProfile && (
            <button
              className="action-btn visibility"
              onClick={() => toggleVisibility(certificate._id, certificate.isHidden)}
              title={certificate.isHidden ? t.show : t.hide}
            >
              <i className={`fas ${certificate.isHidden ? 'fa-eye' : 'fa-eye-slash'}`}></i>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
```

#### 2. التنسيقات (CSS)

```css
/* frontend/src/components/Certificates/CertificatesGallery.css */

.certificate-card.hidden {
  opacity: 0.6;
}

.hidden-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
}

.action-btn.visibility {
  background: var(--accent, #D48161);
  color: white;
}

.action-btn.visibility:hover {
  background: #c06f51;
}
```

---

## 📝 الاستخدام

### 1. في صفحة الملف الشخصي

```jsx
import CertificatesGallery from './components/Certificates/CertificatesGallery';

function ProfilePage() {
  const userId = getCurrentUserId();
  const isOwnProfile = checkIfOwnProfile();
  
  return (
    <div>
      <h1>الملف الشخصي</h1>
      <CertificatesGallery 
        userId={userId} 
        isOwnProfile={isOwnProfile} 
      />
    </div>
  );
}
```

### 2. استخدام المثال الكامل

```jsx
import CertificateVisibilityExample from './examples/CertificateVisibilityExample';

function SettingsPage() {
  return (
    <div>
      <h1>إدارة الشهادات</h1>
      <CertificateVisibilityExample />
    </div>
  );
}
```

---

## 🧪 الاختبارات

### تشغيل الاختبارات

```bash
cd backend
npm test -- certificateVisibility.test.js
```

### الاختبارات المتضمنة (13 اختبار)

1. ✅ إخفاء شهادة
2. ✅ إظهار شهادة مخفية
3. ✅ رفض قيمة غير منطقية (non-boolean)
4. ✅ رفض شهادة غير موجودة (404)
5. ✅ رفض مستخدم غير مصادق (401)
6. ✅ رفض مستخدم لا يملك الشهادة (403)
7. ✅ جلب جميع الشهادات للمالك
8. ✅ استبعاد الشهادات المخفية في العرض العام
9. ✅ القيمة الافتراضية لـ isHidden هي false
10. ✅ السماح بتعيين isHidden إلى true
11. ✅ السماح بتبديل isHidden
12. ✅ فلترة الشهادات حسب الرؤية
13. ✅ إحصائيات الشهادات المرئية/المخفية

---

## 🎨 التصميم

### الألوان

- **مرئية**: `#28a745` (أخضر)
- **مخفية**: `#6c757d` (رمادي)
- **زر الإخفاء**: `#D48161` (نحاسي)

### الأيقونات

- **مرئية**: `fa-eye` (عين مفتوحة)
- **مخفية**: `fa-eye-slash` (عين مغلقة)
- **شهادة**: `fa-certificate`

### الحالات

```css
/* شهادة مرئية */
.certificate-card.is-visible {
  border-left-color: #28a745;
  opacity: 1;
}

/* شهادة مخفية */
.certificate-card.is-hidden {
  border-left-color: #6c757d;
  opacity: 0.7;
}
```

---

## 🔒 الأمان

### 1. المصادقة (Authentication)
- جميع endpoints محمية بـ JWT token
- يجب تسجيل الدخول لتحديث الرؤية

### 2. التفويض (Authorization)
- المستخدم يمكنه فقط تحديث شهاداته الخاصة
- التحقق من الملكية قبل التحديث

### 3. التحقق من البيانات (Validation)
- التحقق من نوع isHidden (يجب أن يكون boolean)
- التحقق من وجود الشهادة
- معالجة الأخطاء الشاملة

---

## 📊 الفوائد المتوقعة

1. **تحكم أفضل للمستخدم**
   - المستخدم يتحكم في ما يظهر في ملفه العام
   - خصوصية أكبر

2. **تجربة مستخدم محسّنة**
   - واجهة بسيطة وسهلة الاستخدام
   - تحديث فوري بدون إعادة تحميل

3. **مرونة في العرض**
   - إخفاء شهادات قديمة أو غير ذات صلة
   - التركيز على الشهادات الأكثر أهمية

---

## 🚀 التحسينات المستقبلية

### المرحلة 2 (اختياري)
- [ ] إعادة ترتيب الشهادات (Drag & Drop)
- [ ] تثبيت شهادات معينة في الأعلى
- [ ] مجموعات الشهادات (Categories)

### المرحلة 3 (اختياري)
- [ ] مشاركة انتقائية (إظهار لمجموعات معينة)
- [ ] جدولة الإظهار/الإخفاء
- [ ] تصدير الشهادات المرئية فقط

---

## 📚 الملفات ذات الصلة

### Backend
- `backend/src/models/Certificate.js` - نموذج البيانات
- `backend/src/services/certificateService.js` - الخدمة
- `backend/src/controllers/certificateController.js` - المعالج
- `backend/src/routes/certificateRoutes.js` - المسارات
- `backend/tests/certificateVisibility.test.js` - الاختبارات

### Frontend
- `frontend/src/components/Certificates/CertificatesGallery.jsx` - المكون الرئيسي
- `frontend/src/components/Certificates/CertificatesGallery.css` - التنسيقات
- `frontend/src/examples/CertificateVisibilityExample.jsx` - مثال كامل
- `frontend/src/examples/CertificateVisibilityExample.css` - تنسيقات المثال

### التوثيق
- `docs/Certificates/CERTIFICATE_VISIBILITY_FEATURE.md` - هذا الملف
- `docs/Certificates/CERTIFICATE_VISIBILITY_QUICK_START.md` - دليل البدء السريع

---

## ✅ الحالة النهائية

- ✅ Backend API مكتمل
- ✅ Frontend Component مكتمل
- ✅ الاختبارات مكتملة (13/13)
- ✅ التوثيق مكتمل
- ✅ دعم متعدد اللغات
- ✅ تصميم متجاوب
- ✅ Dark Mode Support
- ✅ RTL Support
- ✅ Accessibility
- ✅ جاهز للإنتاج

---

**تاريخ الإنشاء**: 2026-03-13  
**آخر تحديث**: 2026-03-13  
**الحالة**: ✅ مكتمل ومفعّل
