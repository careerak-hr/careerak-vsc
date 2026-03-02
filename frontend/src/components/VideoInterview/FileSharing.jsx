/**
 * File Sharing Component
 * مكون مشاركة الملفات أثناء المقابلة
 */

import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import './FileSharing.css';

const FileSharing = ({ interviewId, socket, onFileShared }) => {
  const { language } = useApp();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // الترجمات
  const translations = {
    ar: {
      title: 'مشاركة الملفات',
      selectFile: 'اختر ملف',
      uploading: 'جاري الرفع...',
      uploadSuccess: 'تم رفع الملف بنجاح',
      uploadError: 'فشل رفع الملف',
      noFiles: 'لا توجد ملفات مشاركة',
      download: 'تحميل',
      delete: 'حذف',
      maxSize: 'الحد الأقصى: 10 MB',
      allowedTypes: 'الأنواع المسموح بها: PDF, Word, Excel, PowerPoint, صور, ZIP',
      sharedBy: 'مشارك بواسطة',
      at: 'في'
    },
    en: {
      title: 'File Sharing',
      selectFile: 'Select File',
      uploading: 'Uploading...',
      uploadSuccess: 'File uploaded successfully',
      uploadError: 'Failed to upload file',
      noFiles: 'No shared files',
      download: 'Download',
      delete: 'Delete',
      maxSize: 'Max size: 10 MB',
      allowedTypes: 'Allowed types: PDF, Word, Excel, PowerPoint, Images, ZIP',
      sharedBy: 'Shared by',
      at: 'at'
    },
    fr: {
      title: 'Partage de fichiers',
      selectFile: 'Sélectionner un fichier',
      uploading: 'Téléchargement...',
      uploadSuccess: 'Fichier téléchargé avec succès',
      uploadError: 'Échec du téléchargement',
      noFiles: 'Aucun fichier partagé',
      download: 'Télécharger',
      delete: 'Supprimer',
      maxSize: 'Taille max: 10 MB',
      allowedTypes: 'Types autorisés: PDF, Word, Excel, PowerPoint, Images, ZIP',
      sharedBy: 'Partagé par',
      at: 'à'
    }
  };

  const t = translations[language] || translations.ar;

  // معالجة اختيار الملف
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  // رفع الملف
  const uploadFile = async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      
      const xhr = new XMLHttpRequest();

      // تتبع التقدم
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      // عند الانتهاء
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          
          // إضافة الملف للقائمة
          const newFile = response.file;
          setFiles(prev => [...prev, newFile]);
          
          // إشعار المكون الأب
          if (onFileShared) {
            onFileShared(newFile);
          }

          // إعادة تعيين
          setUploading(false);
          setUploadProgress(0);
          fileInputRef.current.value = '';

          // إشعار نجاح
          alert(t.uploadSuccess);
        } else {
          throw new Error('Upload failed');
        }
      });

      // عند الخطأ
      xhr.addEventListener('error', () => {
        setUploading(false);
        setUploadProgress(0);
        alert(t.uploadError);
      });

      // إرسال الطلب
      xhr.open('POST', `/api/video-interviews/${interviewId}/files`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);

    } catch (error) {
      console.error('Error uploading file:', error);
      setUploading(false);
      setUploadProgress(0);
      alert(t.uploadError);
    }
  };

  // حذف ملف
  const handleDeleteFile = async (fileId, category) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/video-interviews/${interviewId}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category })
      });

      if (response.ok) {
        setFiles(prev => prev.filter(f => f.publicId !== fileId));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  // تنسيق حجم الملف
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // تنسيق التاريخ
  const formatDate = (date) => {
    return new Date(date).toLocaleString(language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US');
  };

  // الاستماع لملفات جديدة من Socket.IO
  React.useEffect(() => {
    if (socket) {
      socket.on('file-shared', (data) => {
        setFiles(prev => [...prev, data.file]);
      });

      socket.on('file-deleted', (data) => {
        setFiles(prev => prev.filter(f => f.publicId !== data.fileId));
      });

      return () => {
        socket.off('file-shared');
        socket.off('file-deleted');
      };
    }
  }, [socket]);

  return (
    <div className="file-sharing-container">
      <div className="file-sharing-header">
        <h3>{t.title}</h3>
        <button
          className="select-file-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? `${t.uploading} ${uploadProgress}%` : t.selectFile}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar"
        />
      </div>

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span>{uploadProgress}%</span>
        </div>
      )}

      <div className="file-info">
        <p className="file-info-text">{t.maxSize}</p>
        <p className="file-info-text">{t.allowedTypes}</p>
      </div>

      <div className="files-list">
        {files.length === 0 ? (
          <p className="no-files">{t.noFiles}</p>
        ) : (
          files.map((file, index) => (
            <div key={index} className="file-item">
              <div className="file-icon">
                {file.category === 'image' ? '🖼️' : 
                 file.category === 'document' ? '📄' : '📦'}
              </div>
              <div className="file-details">
                <p className="file-name">{file.fileName}</p>
                <p className="file-meta">
                  {formatFileSize(file.fileSize)} • 
                  {t.sharedBy} {file.uploadedBy} • 
                  {t.at} {formatDate(file.uploadedAt)}
                </p>
              </div>
              <div className="file-actions">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="file-action-btn download-btn"
                  title={t.download}
                >
                  ⬇️
                </a>
                <button
                  onClick={() => handleDeleteFile(file.publicId, file.category)}
                  className="file-action-btn delete-btn"
                  title={t.delete}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FileSharing;
