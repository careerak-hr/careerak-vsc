/**
 * File Sharing Example
 * مثال استخدام مكون مشاركة الملفات
 */

import React, { useState, useEffect } from 'react';
import FileSharing from '../components/VideoInterview/FileSharing';
import io from 'socket.io-client';

const FileSharingExample = () => {
  const [socket, setSocket] = useState(null);
  const interviewId = 'example-interview-123';

  // إعداد Socket.IO
  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    // الانضمام لغرفة المقابلة
    newSocket.emit('join-interview', interviewId);

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-interview', interviewId);
      newSocket.disconnect();
    };
  }, []);

  // معالجة مشاركة ملف جديد
  const handleFileShared = (file) => {
    console.log('File shared:', file);
    // يمكنك إضافة منطق إضافي هنا
    // مثل: إرسال إشعار، تحديث UI، إلخ
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        مثال مشاركة الملفات
      </h1>

      <FileSharing
        interviewId={interviewId}
        socket={socket}
        onFileShared={handleFileShared}
      />

      <div style={{ marginTop: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>كيفية الاستخدام:</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li>انقر على زر "اختر ملف"</li>
          <li>اختر ملف من جهازك (PDF, Word, Excel, صورة, إلخ)</li>
          <li>سيتم رفع الملف تلقائياً</li>
          <li>سيظهر الملف في القائمة</li>
          <li>يمكنك تحميل أو حذف الملف</li>
          <li>جميع المشاركين في المقابلة سيرون الملف</li>
        </ol>

        <h3 style={{ marginTop: '20px' }}>الأنواع المسموح بها:</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>📄 مستندات: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx), Text (.txt)</li>
          <li>🖼️ صور: JPEG, PNG, GIF, WebP</li>
          <li>📦 أرشيف: ZIP, RAR</li>
        </ul>

        <h3 style={{ marginTop: '20px' }}>القيود:</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>الحد الأقصى لحجم الملف: 10 MB</li>
          <li>يجب أن يكون المستخدم مسجل دخول</li>
          <li>يجب أن يكون المستخدم مشارك في المقابلة</li>
        </ul>
      </div>
    </div>
  );
};

export default FileSharingExample;
