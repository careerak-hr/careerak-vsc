/**
 * FileUploadManager Component
 * 
 * Handles multiple file uploads with drag-and-drop functionality for job applications.
 * 
 * Features:
 * - Drag-and-drop zone
 * - File selection dialog
 * - Upload progress tracking
 * - Uploaded files list display
 * - File removal
 * - Validation errors display
 * - 10 file limit enforcement
 * 
 * Requirements: 4.1, 4.2, 4.5, 4.7, 4.8
 * Design: FileUploadManager component
 */

import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './FileUploadManager.css';

const FileUploadManager = ({
  files = [],
  maxFiles = 10,
  maxSizePerFile = 5, // MB
  allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'],
  onFilesChange,
  onUploadProgress,
  disabled = false
}) => {
  const { language } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(new Map()); // fileId -> progress
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Translations
  const translations = {
    ar: {
      dragDropZone: 'اسحب الملفات هنا أو',
      clickToSelect: 'انقر للاختيار',
      uploadedFiles: 'الملفات المرفوعة',
      noFiles: 'لم يتم رفع أي ملفات بعد',
      remove: 'حذف',
      uploading: 'جاري الرفع...',
      maxFilesReached: `الحد الأقصى ${maxFiles} ملفات`,
      invalidFileType: 'نوع الملف غير مدعوم',
      fileTooLarge: `حجم الملف يتجاوز ${maxSizePerFile} ميجابايت`,
      uploadFailed: 'فشل رفع الملف',
      allowedTypes: 'الأنواع المسموحة: PDF, DOC, DOCX, JPG, PNG',
      fileSize: 'الحجم',
      category: 'الفئة',
      categories: {
        resume: 'السيرة الذاتية',
        cover_letter: 'خطاب التقديم',
        certificate: 'شهادة',
        portfolio: 'معرض الأعمال',
        other: 'أخرى'
      }
    },
    en: {
      dragDropZone: 'Drag files here or',
      clickToSelect: 'click to select',
      uploadedFiles: 'Uploaded Files',
      noFiles: 'No files uploaded yet',
      remove: 'Remove',
      uploading: 'Uploading...',
      maxFilesReached: `Maximum ${maxFiles} files reached`,
      invalidFileType: 'Invalid file type',
      fileTooLarge: `File size exceeds ${maxSizePerFile}MB`,
      uploadFailed: 'Upload failed',
      allowedTypes: 'Allowed types: PDF, DOC, DOCX, JPG, PNG',
      fileSize: 'Size',
      category: 'Category',
      categories: {
        resume: 'Resume',
        cover_letter: 'Cover Letter',
        certificate: 'Certificate',
        portfolio: 'Portfolio',
        other: 'Other'
      }
    },
    fr: {
      dragDropZone: 'Glissez les fichiers ici ou',
      clickToSelect: 'cliquez pour sélectionner',
      uploadedFiles: 'Fichiers téléchargés',
      noFiles: 'Aucun fichier téléchargé',
      remove: 'Supprimer',
      uploading: 'Téléchargement...',
      maxFilesReached: `Maximum ${maxFiles} fichiers atteint`,
      invalidFileType: 'Type de fichier invalide',
      fileTooLarge: `La taille du fichier dépasse ${maxSizePerFile}Mo`,
      uploadFailed: 'Échec du téléchargement',
      allowedTypes: 'Types autorisés: PDF, DOC, DOCX, JPG, PNG',
      fileSize: 'Taille',
      category: 'Catégorie',
      categories: {
        resume: 'CV',
        cover_letter: 'Lettre de motivation',
        certificate: 'Certificat',
        portfolio: 'Portfolio',
        other: 'Autre'
      }
    }
  };

  const t = translations[language] || translations.en;

  // Validate file
  const validateFile = useCallback((file) => {
    const errors = [];

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(t.invalidFileType);
    }

    // Check file size
    const maxSizeBytes = maxSizePerFile * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      errors.push(t.fileTooLarge);
    }

    return errors;
  }, [allowedTypes, maxSizePerFile, t]);

  // Handle file selection
  const handleFileSelect = useCallback(async (selectedFiles) => {
    if (disabled) return;

    const fileArray = Array.from(selectedFiles);
    const newErrors = [];

    // Check max files limit
    if (files.length + fileArray.length > maxFiles) {
      newErrors.push(t.maxFilesReached);
      setErrors(newErrors);
      return;
    }

    // Validate and upload files
    const validFiles = [];
    for (const file of fileArray) {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        newErrors.push(`${file.name}: ${fileErrors.join(', ')}`);
      } else {
        validFiles.push(file);
      }
    }

    setErrors(newErrors);

    // Upload valid files
    for (const file of validFiles) {
      await uploadFile(file);
    }
  }, [files.length, maxFiles, disabled, validateFile, t]);

  // Upload file to Cloudinary
  const uploadFile = async (file) => {
    const fileId = `${Date.now()}-${file.name}`;
    
    try {
      // Add to uploading files
      setUploadingFiles(prev => new Map(prev).set(fileId, 0));

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'careerak_documents');

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadingFiles(prev => new Map(prev).set(fileId, progress));
            if (onUploadProgress) {
              onUploadProgress(fileId, progress);
            }
          }
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      // Create uploaded file object
      const uploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: data.secure_url,
        cloudinaryId: data.public_id,
        category: 'other',
        uploadedAt: new Date()
      };

      // Add to files list
      const updatedFiles = [...files, uploadedFile];
      onFilesChange(updatedFiles);

      // Remove from uploading files
      setUploadingFiles(prev => {
        const newMap = new Map(prev);
        newMap.delete(fileId);
        return newMap;
      });

    } catch (error) {
      console.error('File upload error:', error);
      setErrors(prev => [...prev, `${file.name}: ${t.uploadFailed}`]);
      
      // Remove from uploading files
      setUploadingFiles(prev => {
        const newMap = new Map(prev);
        newMap.delete(fileId);
        return newMap;
      });
    }
  };

  // Handle file removal
  const handleRemoveFile = useCallback(async (fileId) => {
    if (disabled) return;

    const fileToRemove = files.find(f => f.id === fileId);
    if (!fileToRemove) return;

    try {
      // Delete from Cloudinary
      if (fileToRemove.cloudinaryId) {
        await fetch('/api/files/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ cloudinaryId: fileToRemove.cloudinaryId })
        });
      }

      // Remove from files list
      const updatedFiles = files.filter(f => f.id !== fileId);
      onFilesChange(updatedFiles);

    } catch (error) {
      console.error('File removal error:', error);
      setErrors(prev => [...prev, `${fileToRemove.name}: ${t.uploadFailed}`]);
    }
  }, [files, disabled, onFilesChange, t]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [disabled, handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = useCallback((e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      handleFileSelect(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFileSelect]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="file-upload-manager" role="region" aria-label="File upload manager">
      {/* Drag and Drop Zone */}
      <div
        className={`drag-drop-zone ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Drag and drop files or click to select"
        aria-disabled={disabled}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <div className="drag-drop-content">
          <svg className="upload-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="drag-drop-text">
            {t.dragDropZone} <span className="click-text">{t.clickToSelect}</span>
          </p>
          <p className="allowed-types-text">{t.allowedTypes}</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          disabled={disabled}
          aria-label="File input"
        />
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="upload-errors" role="alert" aria-live="polite" aria-atomic="true">
          {errors.map((error, index) => (
            <div key={index} className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <circle cx="12" cy="12" r="10" strokeWidth={2} />
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth={2} strokeLinecap="round" />
                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth={2} strokeLinecap="round" />
              </svg>
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Uploading Files */}
      {uploadingFiles.size > 0 && (
        <div className="uploading-files" role="status" aria-live="polite" aria-label="Files being uploaded">
          {Array.from(uploadingFiles.entries()).map(([fileId, progress]) => (
            <div key={fileId} className="uploading-file">
              <div className="file-info">
                <span className="file-name">{fileId.split('-').slice(1).join('-')}</span>
                <span className="upload-progress" aria-label={`Upload progress ${progress}%`}>{progress}%</span>
              </div>
              <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" aria-label={`Uploading ${fileId.split('-').slice(1).join('-')}`}>
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files List */}
      <div className="uploaded-files">
        <h3 className="uploaded-files-title" id="uploaded-files-heading">{t.uploadedFiles} ({files.length}/{maxFiles})</h3>
        {files.length === 0 ? (
          <p className="no-files-text" role="status">{t.noFiles}</p>
        ) : (
          <ul className="files-list" role="list" aria-labelledby="uploaded-files-heading">
            {files.map((file) => (
              <li key={file.id} className="file-item" role="listitem">
                <div className="file-icon" aria-hidden="true">
                  {file.type.includes('pdf') && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                      <path d="M14 2v6h6M9 13h6M9 17h6M9 9h1" />
                    </svg>
                  )}
                  {file.type.includes('word') && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                      <path d="M14 2v6h6M9 13h6M9 17h6M9 9h1" />
                    </svg>
                  )}
                  {file.type.includes('image') && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  )}
                </div>
                <div className="file-details">
                  <p className="file-name">{file.name}</p>
                  <p className="file-meta">
                    {t.fileSize}: {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => handleRemoveFile(file.id)}
                  disabled={disabled}
                  aria-label={`${t.remove} ${file.name}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FileUploadManager;
