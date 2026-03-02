# دليل البدء السريع - مشاركة الملفات أثناء المقابلات

## ⚡ البدء في 5 دقائق

### 1. Backend Setup (دقيقة واحدة)

```javascript
// في backend/src/app.js
const videoInterviewRoutes = require('./routes/videoInterviewRoutes');
app.use('/api/video-interviews', videoInterviewRoutes);
```

### 2. Frontend Usage (دقيقتان)

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
    return () => newSocket.disconnect();
  }, []);

  return (
    <FileSharing
      interviewId={interviewId}
      socket={socket}
      onFileShared={(file) => console.log('File shared:', file)}
    />
  );
}
```

### 3. Environment Variables (30 ثانية)

```env
# في backend/.env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Test (دقيقة واحدة)

1. شغّل Backend: `npm start`
2. شغّل Frontend: `npm run dev`
3. افتح المتصفح: `http://localhost:5173`
4. اختر ملف وارفعه
5. تحقق من ظهوره في القائمة

---

## 📋 الأنواع المسموح بها

- 📄 PDF, Word, Excel, PowerPoint, Text
- 🖼️ JPEG, PNG, GIF, WebP
- 📦 ZIP, RAR

**الحد الأقصى**: 10 MB

---

## 🔑 API Endpoints

```bash
# رفع ملف
POST /api/video-interviews/:interviewId/files
Content-Type: multipart/form-data
Authorization: Bearer YOUR_TOKEN

# حذف ملف
DELETE /api/video-interviews/:interviewId/files/:fileId
Authorization: Bearer YOUR_TOKEN
```

---

## 🎯 Socket.IO Events

```javascript
// استقبال ملف جديد
socket.on('file-shared', (data) => {
  console.log('New file:', data.file);
});

// استقبال حذف ملف
socket.on('file-deleted', (data) => {
  console.log('Deleted file:', data.fileId);
});
```

---

## 🐛 استكشاف الأخطاء السريع

| المشكلة | الحل |
|---------|------|
| "لم يتم تحديد ملف" | اختر ملف أولاً |
| "نوع الملف غير مسموح به" | استخدم PDF, Word, صورة, إلخ |
| "حجم الملف كبير جداً" | الحد الأقصى 10 MB |
| "فشل رفع الملف" | تحقق من Cloudinary credentials |
| "الملف لا يظهر" | تحقق من Socket.IO connection |

---

## 📚 التوثيق الكامل

للمزيد من التفاصيل، راجع:
- 📄 `docs/VIDEO_INTERVIEW_FILE_SHARING.md` - دليل شامل

---

**تاريخ الإنشاء**: 2026-03-02  
**الحالة**: ✅ جاهز للاستخدام
