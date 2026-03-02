# دليل البدء السريع: إرسال الملفات في مقابلات الفيديو

## ⚡ البدء السريع (5 دقائق)

### 1. Backend Setup

```bash
# لا حاجة لتثبيت إضافي - جميع التبعيات موجودة
cd backend
npm start
```

### 2. Frontend Setup

```bash
cd frontend
npm start
```

### 3. الاستخدام الأساسي

#### رفع ملف
```jsx
import FileUpload from '../components/Chat/FileUpload';

<FileUpload
  conversationId="conversation-123"
  onUploadComplete={(fileData) => {
    console.log('File uploaded:', fileData);
  }}
/>
```

#### عرض ملف
```jsx
import FileMessage from '../components/Chat/FileMessage';

<FileMessage
  file={{
    url: 'https://...',
    name: 'document.pdf',
    size: 12345,
    type: 'file'
  }}
  canDelete={true}
/>
```

---

## 📝 API Endpoints

### رفع ملف
```bash
POST /api/chat/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- file: <file>
- conversationId: <string>

Response:
{
  "success": true,
  "data": {
    "url": "https://...",
    "name": "file.pdf",
    "size": 12345,
    "mimeType": "application/pdf",
    "cloudinaryId": "abc123",
    "type": "file"
  }
}
```

### حذف ملف
```bash
DELETE /api/chat/files/:cloudinaryId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "تم حذف الملف بنجاح"
}
```

---

## 🧪 الاختبار

```bash
cd backend
npm test -- chatFileUpload.test.js
```

**النتيجة المتوقعة**: ✅ 10/10 اختبارات نجحت

---

## 📦 الملفات المضافة

### Backend (3 ملفات)
- `backend/src/controllers/chatFileController.js`
- `backend/src/routes/chatRoutes.js` (محدّث)
- `backend/tests/chatFileUpload.test.js`

### Frontend (5 ملفات)
- `frontend/src/components/Chat/FileUpload.jsx`
- `frontend/src/components/Chat/FileUpload.css`
- `frontend/src/components/Chat/FileMessage.jsx`
- `frontend/src/components/Chat/FileMessage.css`
- `frontend/src/examples/ChatFileUploadExample.jsx`

### Documentation (2 ملفات)
- `docs/VIDEO_INTERVIEWS_FILE_UPLOAD.md`
- `docs/VIDEO_INTERVIEWS_FILE_UPLOAD_QUICK_START.md`

---

## ✅ الميزات

- ✅ رفع صور (JPG, PNG, GIF, WebP, SVG)
- ✅ رفع مستندات (PDF, DOC, DOCX, TXT, RTF)
- ✅ Drag & Drop
- ✅ شريط التقدم
- ✅ معاينة الصور
- ✅ تحميل وحذف
- ✅ دعم 3 لغات (ar, en, fr)
- ✅ تصميم متجاوب
- ✅ Dark Mode

---

## 🎯 مثال كامل

```jsx
import React, { useState } from 'react';
import FileUpload from '../components/Chat/FileUpload';
import FileMessage from '../components/Chat/FileMessage';

function ChatWithFiles() {
  const [messages, setMessages] = useState([]);

  const handleUploadComplete = (fileData) => {
    // إضافة الملف إلى الرسائل
    const newMessage = {
      id: Date.now(),
      file: fileData,
      canDelete: true
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div>
      {/* رفع الملفات */}
      <FileUpload
        conversationId="conv-123"
        onUploadComplete={handleUploadComplete}
      />

      {/* عرض الملفات */}
      {messages.map(msg => (
        <FileMessage
          key={msg.id}
          file={msg.file}
          canDelete={msg.canDelete}
          onDownload={(file) => window.open(file.url, '_blank')}
          onDelete={(file) => {
            setMessages(messages.filter(m => m.id !== msg.id));
          }}
        />
      ))}
    </div>
  );
}
```

---

## 🔧 استكشاف الأخطاء

### "لم يتم رفع أي ملف"
- تأكد من إرسال الملف في FormData
- تأكد من اسم الحقل: `file`

### "نوع الملف غير مدعوم"
- الأنواع المدعومة فقط:
  - صور: JPG, PNG, GIF, WebP, SVG
  - مستندات: PDF, DOC, DOCX, TXT, RTF

### "الحد الأقصى للحجم"
- الحد الأقصى: 10 ميجابايت
- قلل حجم الملف قبل الرفع

### "خطأ في الرفع"
- تحقق من اتصال الإنترنت
- تحقق من إعدادات Cloudinary
- تحقق من token المصادقة

---

## 📚 التوثيق الكامل

للمزيد من التفاصيل، راجع:
- 📄 `docs/VIDEO_INTERVIEWS_FILE_UPLOAD.md` - توثيق شامل

---

**تاريخ الإنشاء**: 2026-03-02  
**الحالة**: ✅ جاهز للاستخدام
