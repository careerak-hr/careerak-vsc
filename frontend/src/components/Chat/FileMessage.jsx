import React from 'react';
import { useApp } from '../../context/AppContext';
import './FileMessage.css';

const FileMessage = ({ file, onDownload, onDelete, canDelete }) => {
  const { language } = useApp();

  const translations = {
    ar: {
      download: 'تحميل',
      delete: 'حذف',
      image: 'صورة',
      document: 'مستند',
      file: 'ملف'
    },
    en: {
      download: 'Download',
      delete: 'Delete',
      image: 'Image',
      document: 'Document',
      file: 'File'
    },
    fr: {
      download: 'Télécharger',
      delete: 'Supprimer',
      image: 'Image',
      document: 'Document',
      file: 'Fichier'
    }
  };

  const t = translations[language] || translations.ar;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (file.type === 'image') {
      return (
        <svg className="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    
    if (file.mimeType === 'application/pdf') {
      return (
        <svg className="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }

    return (
      <svg className="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(file);
    } else {
      // فتح الملف في تبويب جديد
      window.open(file.url, '_blank');
    }
  };

  const handleDelete = () => {
    if (onDelete && canDelete) {
      onDelete(file);
    }
  };

  // إذا كان الملف صورة، عرضها
  if (file.type === 'image') {
    return (
      <div className="file-message image-message">
        <img 
          src={file.url} 
          alt={file.name} 
          className="message-image"
          onClick={handleDownload}
        />
        <div className="file-info">
          <span className="file-name">{file.name}</span>
          <span className="file-size">{formatFileSize(file.size)}</span>
        </div>
        {canDelete && (
          <button 
            className="delete-file-btn" 
            onClick={handleDelete}
            title={t.delete}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  // عرض الملفات الأخرى (PDF، مستندات)
  return (
    <div className="file-message document-message">
      <div className="file-content">
        {getFileIcon()}
        <div className="file-details">
          <span className="file-name">{file.name}</span>
          <span className="file-size">{formatFileSize(file.size)}</span>
        </div>
      </div>
      <div className="file-actions">
        <button 
          className="download-btn" 
          onClick={handleDownload}
          title={t.download}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
        {canDelete && (
          <button 
            className="delete-btn" 
            onClick={handleDelete}
            title={t.delete}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default FileMessage;
