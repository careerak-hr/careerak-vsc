# معاينة منشور LinkedIn - دليل البدء السريع

## التثبيت (5 دقائق)

### 1. Backend (جاهز بالفعل ✅)
الـ API endpoint موجود في:
- `POST /api/linkedin/preview-post`

### 2. Frontend
```bash
# المكون موجود في:
frontend/src/components/LinkedIn/LinkedInPostPreview.jsx
frontend/src/components/LinkedIn/LinkedInPostPreview.css
```

## الاستخدام السريع

### في صفحة الشهادة
```jsx
import { useState } from 'react';
import LinkedInPostPreview from '../components/LinkedIn/LinkedInPostPreview';

function CertificatePage() {
  const [showPreview, setShowPreview] = useState(false);
  const certificateId = '...'; // من props أو state
  const token = '...'; // من context أو localStorage

  const handleShare = async (certId) => {
    const response = await fetch('/api/linkedin/share-certificate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ certificateId: certId })
    });
    
    if (response.ok) {
      alert('تم النشر بنجاح!');
    }
  };

  return (
    <div>
      <button onClick={() => setShowPreview(true)}>
        معاينة المنشور
      </button>

      {showPreview && (
        <LinkedInPostPreview
          certificateId={certificateId}
          token={token}
          onShare={handleShare}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
```

## الاختبار
```bash
cd backend
npm test -- linkedInPreview.test.js
```

## الميزات
- ✅ معاينة كاملة للمنشور
- ✅ تقدير مدى الوصول
- ✅ نصائح لتحسين التفاعل
- ✅ تصميم يحاكي LinkedIn
- ✅ RTL + Dark Mode
- ✅ متجاوب

## المزيد
📄 التوثيق الكامل: `docs/LINKEDIN_POST_PREVIEW.md`
