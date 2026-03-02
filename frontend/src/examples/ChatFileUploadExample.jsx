import React, { useState } from 'react';
import FileUpload from '../components/Chat/FileUpload';
import FileMessage from '../components/Chat/FileMessage';
import { useApp } from '../context/AppContext';

/**
 * مثال كامل لاستخدام نظام رفع الملفات في الدردشة
 * 
 * الميزات:
 * - رفع الملفات (صور، PDF، مستندات)
 * - عرض الملفات المرفقة
 * - تحميل الملفات
 * - حذف الملفات
 * - دعم Drag & Drop
 * - شريط التقدم
 * - معالجة الأخطاء
 * - دعم متعدد اللغات
 */
const ChatFileUploadExample = () => {
  const { language } = useApp();
  const [messages, setMessages] = useState([]);
  const [conversationId] = useState('example-conversation-123');

  const translations = {
    ar: {
      title: 'مثال: رفع الملفات في الدردشة',
      description: 'يمكنك رفع الصور والمستندات (PDF, DOC, DOCX, TXT, RTF)',
      uploadedFiles: 'الملفات المرفقة',
      noFiles: 'لا توجد ملفات مرفقة بعد',
      sendMessage: 'إرسال رسالة مع ملف',
      fileSelected: 'تم اختيار الملف',
      fileUploaded: 'تم رفع الملف بنجاح',
      fileDeleted: 'تم حذف الملف'
    },
    en: {
      title: 'Example: File Upload in Chat',
      description: 'You can upload images and documents (PDF, DOC, DOCX, TXT, RTF)',
      uploadedFiles: 'Uploaded Files',
      noFiles: 'No files uploaded yet',
      sendMessage: 'Send message with file',
      fileSelected: 'File selected',
      fileUploaded: 'File uploaded successfully',
      fileDeleted: 'File deleted'
    },
    fr: {
      title: 'Exemple: Téléchargement de fichiers dans le chat',
      description: 'Vous pouvez télécharger des images et des documents (PDF, DOC, DOCX, TXT, RTF)',
      uploadedFiles: 'Fichiers téléchargés',
      noFiles: 'Aucun fichier téléchargé pour le moment',
      sendMessage: 'Envoyer un message avec un fichier',
      fileSelected: 'Fichier sélectionné',
      fileUploaded: 'Fichier téléchargé avec succès',
      fileDeleted: 'Fichier supprimé'
    }
  };

  const t = translations[language] || translations.ar;

  const handleFileSelect = (file) => {
    console.log('File selected:', file.name);
    alert(`${t.fileSelected}: ${file.name}`);
  };

  const handleUploadComplete = (fileData) => {
    console.log('File uploaded:', fileData);
    
    // إضافة الملف إلى قائمة الرسائل
    const newMessage = {
      id: Date.now(),
      type: fileData.type,
      file: fileData,
      timestamp: new Date(),
      canDelete: true
    };
    
    setMessages([...messages, newMessage]);
    alert(t.fileUploaded);
  };

  const handleDownload = (file) => {
    console.log('Downloading file:', file.name);
    window.open(file.url, '_blank');
  };

  const handleDelete = (file) => {
    console.log('Deleting file:', file.name);
    
    // حذف الملف من قائمة الرسائل
    setMessages(messages.filter(msg => msg.file.cloudinaryId !== file.cloudinaryId));
    alert(t.fileDeleted);
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '2rem auto', 
      padding: '2rem',
      fontFamily: 'Amiri, serif'
    }}>
      <h1 style={{ 
        color: '#304B60', 
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        {t.title}
      </h1>
      
      <p style={{ 
        color: '#666', 
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        {t.description}
      </p>

      {/* مكون رفع الملفات */}
      <FileUpload
        conversationId={conversationId}
        onFileSelect={handleFileSelect}
        onUploadComplete={handleUploadComplete}
      />

      {/* عرض الملفات المرفقة */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ 
          color: '#304B60', 
          marginBottom: '1rem',
          fontSize: '1.5rem'
        }}>
          {t.uploadedFiles}
        </h2>

        {messages.length === 0 ? (
          <p style={{ 
            color: '#999', 
            textAlign: 'center',
            padding: '2rem'
          }}>
            {t.noFiles}
          </p>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem' 
          }}>
            {messages.map((message) => (
              <FileMessage
                key={message.id}
                file={message.file}
                onDownload={handleDownload}
                onDelete={handleDelete}
                canDelete={message.canDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* معلومات إضافية */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        border: '1px solid #D4816180'
      }}>
        <h3 style={{ 
          color: '#304B60', 
          marginBottom: '0.5rem',
          fontSize: '1.25rem'
        }}>
          الميزات المدعومة:
        </h3>
        <ul style={{ 
          color: '#666',
          paddingRight: '1.5rem',
          margin: '0.5rem 0'
        }}>
          <li>رفع الصور: JPG, PNG, GIF, WebP, SVG</li>
          <li>رفع المستندات: PDF, DOC, DOCX, TXT, RTF</li>
          <li>الحد الأقصى للحجم: 10 ميجابايت</li>
          <li>Drag & Drop مدعوم</li>
          <li>شريط التقدم أثناء الرفع</li>
          <li>معاينة الصور</li>
          <li>تحميل الملفات</li>
          <li>حذف الملفات</li>
        </ul>
      </div>

      {/* كود المثال */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#2a2a2a',
        borderRadius: '8px',
        color: '#E3DAD1',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        overflow: 'auto'
      }}>
        <pre style={{ margin: 0 }}>
{`// استخدام مكون رفع الملفات
<FileUpload
  conversationId={conversationId}
  onFileSelect={(file) => {
    console.log('File selected:', file.name);
  }}
  onUploadComplete={(fileData) => {
    console.log('File uploaded:', fileData);
    // إضافة الملف إلى الرسائل
  }}
/>

// عرض الملف المرفق
<FileMessage
  file={fileData}
  onDownload={(file) => {
    window.open(file.url, '_blank');
  }}
  onDelete={(file) => {
    // حذف الملف
  }}
  canDelete={true}
/>`}
        </pre>
      </div>
    </div>
  );
};

export default ChatFileUploadExample;
