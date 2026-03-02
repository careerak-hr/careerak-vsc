import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import './FileUpload.css';

const FileUpload = ({ conversationId, onFileSelect, onUploadComplete }) => {
  const { language } = useApp();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const translations = {
    ar: {
      selectFile: 'اختر ملف',
      uploading: 'جاري الرفع...',
      uploadSuccess: 'تم رفع الملف بنجاح',
      uploadError: 'خطأ في رفع الملف',
      supportedFormats: 'الأنواع المدعومة: صور (JPG, PNG, GIF, WebP, SVG)، مستندات (PDF, DOC, DOCX, TXT, RTF)',
      maxSize: 'الحد الأقصى: 10 ميجابايت',
      dragDrop: 'اسحب وأفلت الملف هنا أو',
      clickToSelect: 'انقر للاختيار'
    },
    en: {
      selectFile: 'Select File',
      uploading: 'Uploading...',
      uploadSuccess: 'File uploaded successfully',
      uploadError: 'Error uploading file',
      supportedFormats: 'Supported: Images (JPG, PNG, GIF, WebP, SVG), Documents (PDF, DOC, DOCX, TXT, RTF)',
      maxSize: 'Max size: 10 MB',
      dragDrop: 'Drag and drop file here or',
      clickToSelect: 'click to select'
    },
    fr: {
      selectFile: 'Sélectionner un fichier',
      uploading: 'Téléchargement...',
      uploadSuccess: 'Fichier téléchargé avec succès',
      uploadError: 'Erreur lors du téléchargement',
      supportedFormats: 'Pris en charge: Images (JPG, PNG, GIF, WebP, SVG), Documents (PDF, DOC, DOCX, TXT, RTF)',
      maxSize: 'Taille max: 10 Mo',
      dragDrop: 'Glissez-déposez le fichier ici ou',
      clickToSelect: 'cliquez pour sélectionner'
    }
  };

  const t = translations[language] || translations.ar;

  const handleFileSelect = async (file) => {
    if (!file) return;

    // التحقق من حجم الملف (10 ميجابايت)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(t.maxSize);
      return;
    }

    // التحقق من نوع الملف
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/rtf'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(t.supportedFormats);
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);

      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
          setUploading(false);
          setUploadProgress(0);
          
          if (onUploadComplete) {
            onUploadComplete(response.data);
          }
        } else {
          const response = JSON.parse(xhr.responseText);
          setError(response.message || t.uploadError);
          setUploading(false);
          setUploadProgress(0);
        }
      });

      // عند حدوث خطأ
      xhr.addEventListener('error', () => {
        setError(t.uploadError);
        setUploading(false);
        setUploadProgress(0);
      });

      xhr.open('POST', `${apiUrl}/api/chat/files/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);

    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.message || t.uploadError);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload-container">
      <div 
        className="file-upload-dropzone"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleInputChange}
          accept="image/*,.pdf,.doc,.docx,.txt,.rtf"
          style={{ display: 'none' }}
        />
        
        {uploading ? (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p>{t.uploading} {uploadProgress}%</p>
          </div>
        ) : (
          <div className="upload-prompt">
            <svg 
              className="upload-icon" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            <p>
              {t.dragDrop} <span className="link-text">{t.clickToSelect}</span>
            </p>
            <p className="upload-hint">{t.supportedFormats}</p>
            <p className="upload-hint">{t.maxSize}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="upload-error">
          <svg 
            className="error-icon" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
