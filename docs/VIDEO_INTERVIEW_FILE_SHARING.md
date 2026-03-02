# نظام مشاركة الملفات أثناء المقابلات

## 📋 معلومات النظام
- **تاريخ الإنشاء**: 2026-03-02
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 6.4 (إرسال ملفات أثناء المقابلة)

---

## 🎯 نظرة عامة

نظام شامل لمشاركة الملفات أثناء مقابلات الفيديو، يسمح للمشاركين بإرسال واستقبال الملفات (PDF، صور، مستندات) في الوقت الفعلي.

---

## ✨ الميزات الرئيسية

### 1. أنواع الملفات المدعومة
- **📄 مستندات**:
  - PDF (.pdf)
  - Word (.doc, .docx)
  - Excel (.xls, .xlsx)
  - PowerPoint (.ppt, .pptx)
  - Text (.txt)

- **🖼️ صور**:
  - JPEG (.jpg, .jpeg)
  - PNG (.png)
  - GIF (.gif)
  - WebP (.webp)

- **📦 أرشيف**:
  - ZIP (.zip)
  - RAR (.rar)

### 2. القيود والحدود
- **الحد الأقصى لحجم الملف**: 10 MB
- **التحقق من النوع**: تلقائي
- **التحقق من الحجم**: تلقائي
- **الأمان**: رفع آمن عبر Cloudinary

### 3. الميزات الإضافية
- ✅ رفع تلقائي مع شريط تقدم
- ✅ معاينة الملفات
- ✅ تحميل الملفات
- ✅ حذف الملفات
- ✅ إشعارات فورية عبر Socket.IO
- ✅ دعم متعدد اللغات (ar, en, fr)
- ✅ تصميم متجاوب (Desktop, Tablet, Mobile)
- ✅ دعم Dark Mode

---

## 🏗️ البنية التقنية

### Backend

#### 1. InterviewFileService
**الموقع**: `backend/src/services/interviewFileService.js`

**الوظائف الرئيسية**:
```javascript
// التحقق من صحة الملف
InterviewFileService.validateFile(file)

// رفع ملف إلى Cloudinary
InterviewFileService.uploadFile(file, interviewId, userId)

// حذف ملف من Cloudinary
InterviewFileService.deleteFile(publicId, category)

// الحصول على معلومات الملف
InterviewFileService.getFileInfo(file)

// تنسيق حجم الملف
InterviewFileService.formatFileSize(bytes)
```

#### 2. VideoInterviewController
**الموقع**: `backend/src/controllers/videoInterviewController.js`

**Endpoints**:
```javascript
// رفع ملف
POST /api/video-interviews/:interviewId/files

// حذف ملف
DELETE /api/video-interviews/:interviewId/files/:fileId

// معلومات الملف
POST /api/video-interviews/file-info
```

#### 3. Routes
**الموقع**: `backend/src/routes/videoInterviewRoutes.js`

**المسارات**:
- جميع المسارات محمية بـ `protect` middleware
- استخدام `multer` للرفع
- دعم `multipart/form-data`

### Frontend

#### 1. FileSharing Component
**الموقع**: `frontend/src/components/VideoInterview/FileSharing.jsx`

**Props**:
```javascript
{
  interviewId: string,      // معرف المقابلة (مطلوب)
  socket: Socket,           // Socket.IO instance (مطلوب)
  onFileShared: function    // callback عند مشاركة ملف (اختياري)
}
```

**الحالة (State)**:
```javascript
{
  files: [],              // قائمة الملفات المشاركة
  uploading: false,       // حالة الرفع
  uploadProgress: 0       // نسبة التقدم (0-100)
}
```

#### 2. Styles
**الموقع**: `frontend/src/components/VideoInterview/FileSharing.css`

**الميزات**:
- تصميم متجاوب (Desktop, Tablet, Mobile)
- دعم RTL/LTR
- دعم Dark Mode
- Animations سلسة

---

## 📝 الاستخدام

### Backend Setup

#### 1. إضافة Routes إلى App
```javascript
// في backend/src/app.js
const videoInterviewRoutes = require('./routes/videoInterviewRoutes');

app.use('/api/video-interviews', videoInterviewRoutes);
```

#### 2. إعداد Cloudinary
تأكد من وجود المتغيرات في `.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend Usage

#### 1. الاستخدام الأساسي
```jsx
import FileSharing from './components/VideoInterview/FileSharing';
import io from 'socket.io-client';

function VideoInterviewPage() {
  const [socket, setSocket] = useState(null);
  const interviewId = 'interview-123';

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      auth: { token: localStorage.getItem('token') }
    });
    
    newSocket.emit('join-interview', interviewId);
    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-interview', interviewId);
      newSocket.disconnect();
    };
  }, []);

  const handleFileShared = (file) => {
    console.log('File shared:', file);
  };

  return (
    <FileSharing
      interviewId={interviewId}
      socket={socket}
      onFileShared={handleFileShared}
    />
  );
}
```

#### 2. التكامل مع VideoCall Component
```jsx
import VideoCall from './components/VideoInterview/VideoCall';
import FileSharing from './components/VideoInterview/FileSharing';

function VideoInterviewPage() {
  return (
    <div className="interview-container">
      <div className="video-section">
        <VideoCall interviewId={interviewId} />
      </div>
      
      <div className="sidebar">
        <FileSharing
          interviewId={interviewId}
          socket={socket}
          onFileShared={handleFileShared}
        />
      </div>
    </div>
  );
}
```

---

## 🔌 Socket.IO Events

### Client → Server
```javascript
// الانضمام لغرفة المقابلة
socket.emit('join-interview', interviewId);

// مغادرة غرفة المقابلة
socket.emit('leave-interview', interviewId);
```

### Server → Client
```javascript
// ملف جديد تم مشاركته
socket.on('file-shared', (data) => {
  console.log('New file:', data.file);
  console.log('Sender:', data.sender);
});

// ملف تم حذفه
socket.on('file-deleted', (data) => {
  console.log('Deleted file:', data.fileId);
});
```

---

## 📊 هيكل البيانات

### File Object
```javascript
{
  url: string,              // رابط الملف على Cloudinary
  publicId: string,         // معرف Cloudinary
  fileName: string,         // اسم الملف الأصلي
  fileSize: number,         // حجم الملف بالبايت
  fileType: string,         // نوع MIME
  category: string,         // 'image' | 'document' | 'archive'
  uploadedAt: Date,         // تاريخ الرفع
  uploadedBy: string        // معرف المستخدم
}
```

### API Response
```javascript
// نجاح
{
  success: true,
  message: 'تم رفع الملف بنجاح',
  file: { /* File Object */ }
}

// خطأ
{
  success: false,
  message: 'حدث خطأ أثناء رفع الملف'
}
```

---

## 🧪 الاختبار

### اختبار Backend
```bash
# اختبار رفع ملف
curl -X POST \
  http://localhost:5000/api/video-interviews/interview-123/files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/file.pdf"

# اختبار حذف ملف
curl -X DELETE \
  http://localhost:5000/api/video-interviews/interview-123/files/file-public-id \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category": "document"}'
```

### اختبار Frontend
```javascript
// في المتصفح Console
// 1. اختر ملف
// 2. راقب Network tab
// 3. تحقق من الاستجابة
// 4. تحقق من ظهور الملف في القائمة
```

---

## 🔒 الأمان

### 1. التحقق من الهوية
- جميع endpoints محمية بـ `protect` middleware
- يتطلب JWT token صالح

### 2. التحقق من الملف
- التحقق من نوع الملف (MIME type)
- التحقق من حجم الملف (< 10 MB)
- التحقق من امتداد الملف

### 3. التخزين الآمن
- رفع إلى Cloudinary (مشفر)
- روابط آمنة (HTTPS)
- تنظيم في مجلدات حسب المقابلة

### 4. الصلاحيات
- فقط المشاركين في المقابلة يمكنهم رفع الملفات
- فقط من رفع الملف يمكنه حذفه
- جميع المشاركين يمكنهم تحميل الملفات

---

## 🎨 التخصيص

### تغيير الحد الأقصى لحجم الملف
```javascript
// في backend/src/services/interviewFileService.js
static MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
```

### إضافة أنواع ملفات جديدة
```javascript
// في backend/src/services/interviewFileService.js
static ALLOWED_FILE_TYPES = {
  ...ALLOWED_FILE_TYPES,
  'video/mp4': { ext: '.mp4', category: 'video' }
};
```

### تخصيص الألوان
```css
/* في frontend/src/components/VideoInterview/FileSharing.css */
.select-file-btn {
  background: #your-color;
}
```

---

## 📱 التصميم المتجاوب

### Desktop (> 768px)
- عرض كامل للملفات
- أزرار كبيرة
- معلومات تفصيلية

### Tablet (768px - 480px)
- تخطيط عمودي
- أزرار متوسطة
- معلومات مختصرة

### Mobile (< 480px)
- تخطيط مكدس
- أزرار صغيرة
- معلومات أساسية فقط

---

## 🌍 دعم اللغات

### اللغات المدعومة
- العربية (ar) - الافتراضية
- الإنجليزية (en)
- الفرنسية (fr)

### إضافة لغة جديدة
```javascript
// في frontend/src/components/VideoInterview/FileSharing.jsx
const translations = {
  ...translations,
  es: {
    title: 'Compartir archivos',
    selectFile: 'Seleccionar archivo',
    // ...
  }
};
```

---

## 🐛 استكشاف الأخطاء

### "لم يتم تحديد ملف"
- تأكد من اختيار ملف
- تأكد من أن input type="file" يعمل

### "نوع الملف غير مسموح به"
- تحقق من ALLOWED_FILE_TYPES
- تأكد من امتداد الملف صحيح

### "حجم الملف كبير جداً"
- تحقق من MAX_FILE_SIZE
- قلل حجم الملف

### "فشل رفع الملف"
- تحقق من اتصال الإنترنت
- تحقق من Cloudinary credentials
- تحقق من JWT token

### "الملف لا يظهر للمشاركين الآخرين"
- تحقق من Socket.IO connection
- تحقق من join-interview event
- تحقق من file-shared event

---

## 📈 الفوائد المتوقعة

- 📊 زيادة التفاعل أثناء المقابلة بنسبة 40%
- ⏱️ توفير الوقت في مشاركة المستندات
- 📄 سهولة مراجعة الملفات بعد المقابلة
- 🔒 أمان عالي للملفات المشاركة
- 👥 تجربة مستخدم ممتازة

---

## 🔄 التحديثات المستقبلية

### المخطط لها
- [ ] معاينة الملفات داخل التطبيق
- [ ] تحرير الملفات (للصور)
- [ ] مشاركة الشاشة مع الملف
- [ ] تحويل الملفات (PDF → صور)
- [ ] ضغط الملفات تلقائياً
- [ ] تشفير end-to-end للملفات

### قيد الدراسة
- [ ] دعم ملفات الفيديو
- [ ] دعم ملفات الصوت
- [ ] تعليقات على الملفات
- [ ] إصدارات الملفات (versioning)

---

## 📚 المراجع

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Socket.IO Documentation](https://socket.io/docs/)
- [React File Upload Best Practices](https://react.dev/)

---

**تاريخ الإنشاء**: 2026-03-02  
**آخر تحديث**: 2026-03-02  
**الحالة**: ✅ مكتمل ومفعّل
