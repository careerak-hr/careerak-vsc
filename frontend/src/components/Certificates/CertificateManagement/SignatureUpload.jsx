import React, { useState, useRef } from 'react';
import { useApp } from '../../../context/AppContext';

const translations = {
  ar: {
    title: 'رفع التوقيع الرقمي',
    subtitle: 'أضف توقيعك الرقمي ليظهر على الشهادات الصادرة',
    selectTemplate: 'اختر القالب',
    noTemplates: 'لا توجد قوالب. أنشئ قالباً أولاً.',
    uploadArea: 'اسحب وأفلت صورة التوقيع هنا',
    uploadOr: 'أو انقر للاختيار',
    uploadHint: 'PNG أو JPG أو SVG - حجم أقصى 5MB',
    signerName: 'اسم الموقّع',
    signerTitle: 'المسمى الوظيفي',
    namePlaceholder: 'مثال: أ. محمد أحمد',
    titlePlaceholder: 'مثال: مدير التدريب',
    preview: 'معاينة التوقيع',
    upload: 'رفع التوقيع',
    uploading: 'جاري الرفع...',
    remove: 'حذف التوقيع',
    currentSig: 'التوقيع الحالي',
    noSig: 'لا يوجد توقيع مرفوع',
    successMsg: 'تم رفع التوقيع بنجاح',
    errorMsg: 'حدث خطأ أثناء رفع التوقيع',
    errorType: 'يُسمح فقط بملفات الصور (PNG, JPG, SVG)',
    errorSize: 'حجم الملف يتجاوز 5MB',
  },
  en: {
    title: 'Digital Signature Upload',
    subtitle: 'Add your digital signature to appear on issued certificates',
    selectTemplate: 'Select Template',
    noTemplates: 'No templates found. Create a template first.',
    uploadArea: 'Drag & drop your signature image here',
    uploadOr: 'or click to browse',
    uploadHint: 'PNG, JPG or SVG - Max 5MB',
    signerName: 'Signer Name',
    signerTitle: 'Job Title',
    namePlaceholder: 'e.g. Dr. John Smith',
    titlePlaceholder: 'e.g. Training Director',
    preview: 'Signature Preview',
    upload: 'Upload Signature',
    uploading: 'Uploading...',
    remove: 'Remove Signature',
    currentSig: 'Current Signature',
    noSig: 'No signature uploaded',
    successMsg: 'Signature uploaded successfully',
    errorMsg: 'Error uploading signature',
    errorType: 'Only image files are allowed (PNG, JPG, SVG)',
    errorSize: 'File size exceeds 5MB',
  },
  fr: {
    title: 'Téléchargement de Signature Numérique',
    subtitle: 'Ajoutez votre signature numérique pour les certificats émis',
    selectTemplate: 'Sélectionner un Modèle',
    noTemplates: 'Aucun modèle trouvé. Créez un modèle en premier.',
    uploadArea: 'Glissez-déposez votre image de signature ici',
    uploadOr: 'ou cliquez pour parcourir',
    uploadHint: 'PNG, JPG ou SVG - Max 5MB',
    signerName: 'Nom du Signataire',
    signerTitle: 'Titre du Poste',
    namePlaceholder: 'ex. Dr. Jean Dupont',
    titlePlaceholder: 'ex. Directeur de Formation',
    preview: 'Aperçu de la Signature',
    upload: 'Télécharger la Signature',
    uploading: 'Téléchargement...',
    remove: 'Supprimer la Signature',
    currentSig: 'Signature Actuelle',
    noSig: 'Aucune signature téléchargée',
    successMsg: 'Signature téléchargée avec succès',
    errorMsg: 'Erreur lors du téléchargement',
    errorType: 'Seuls les fichiers image sont autorisés (PNG, JPG, SVG)',
    errorSize: 'La taille du fichier dépasse 5MB',
  },
};

const SignatureUpload = ({ templates = [], onTemplatesChange }) => {
  const { language } = useApp();
  const t = translations[language] || translations.ar;
  const fontFamily = language === 'ar' ? "'Amiri', 'Cairo', serif"
    : language === 'fr' ? "'EB Garamond', serif"
    : "'Cormorant Garamond', serif";

  const [selectedTemplateId, setSelectedTemplateId] = useState(
    templates.find(t => t.isDefault)?._id || templates[0]?._id || ''
  );
  const [previewUrl, setPreviewUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [signerName, setSignerName] = useState('');
  const [signerTitle, setSignerTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const fontStyle = { fontFamily };

  const selectedTemplate = templates.find(t => t._id === selectedTemplateId);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setAlert({ type: 'error', msg: t.errorType });
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setAlert({ type: 'error', msg: t.errorSize });
      return;
    }

    setFile(selectedFile);
    setAlert(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleUpload = async () => {
    if (!file || !selectedTemplateId) return;

    setUploading(true);
    setAlert(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('signature', file);
      if (signerName) formData.append('signerName', signerName);
      if (signerTitle) formData.append('signerTitle', signerTitle);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/certificates/management/templates/${selectedTemplateId}/signature`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t.errorMsg);

      // Also update name/title if provided
      if (signerName || signerTitle) {
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/certificates/management/templates/${selectedTemplateId}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              signature: {
                name: signerName,
                title: signerTitle,
                imageUrl: data.signatureUrl,
              },
            }),
          }
        );
      }

      setAlert({ type: 'success', msg: t.successMsg });
      setFile(null);
      if (onTemplatesChange) onTemplatesChange();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedTemplateId) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/certificates/management/templates/${selectedTemplateId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ signature: { imageUrl: null, name: '', title: '' } }),
        }
      );
      setPreviewUrl(null);
      setFile(null);
      if (onTemplatesChange) onTemplatesChange();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally {
      setUploading(false);
    }
  };

  const currentSigUrl = selectedTemplate?.signature?.imageUrl;

  return (
    <div className="signature-upload-section" style={fontStyle}>
      <p style={{ color: '#666', marginBottom: 20, fontSize: '0.9rem' }}>{t.subtitle}</p>

      {/* Template selector */}
      {templates.length === 0 ? (
        <div className="alert error">{t.noTemplates}</div>
      ) : (
        <div className="form-group">
          <label className="form-label">{t.selectTemplate}</label>
          <select
            className="form-select"
            value={selectedTemplateId}
            onChange={e => {
              setSelectedTemplateId(e.target.value);
              setPreviewUrl(null);
              setFile(null);
              setAlert(null);
            }}
          >
            {templates.map(tpl => (
              <option key={tpl._id} value={tpl._id}>
                {tpl.name} {tpl.isDefault ? '★' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {alert && <div className={`alert ${alert.type}`}>{alert.msg}</div>}

      {/* Current signature */}
      {currentSigUrl && !previewUrl && (
        <div className="signature-preview">
          <div className="signature-preview-label">{t.currentSig}</div>
          <img src={currentSigUrl} alt="signature" />
          {selectedTemplate?.signature?.name && (
            <div style={{ marginTop: 8, fontSize: '0.85rem', color: '#304B60' }}>
              {selectedTemplate.signature.name}
              {selectedTemplate.signature.title && ` — ${selectedTemplate.signature.title}`}
            </div>
          )}
          <div className="signature-actions">
            <button className="btn-remove" onClick={handleRemove} disabled={uploading}>
              {t.remove}
            </button>
          </div>
        </div>
      )}

      {/* Upload area */}
      <div
        className="signature-upload-area"
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{ borderColor: isDragging ? '#D48161' : undefined }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
          onChange={e => handleFileSelect(e.target.files[0])}
        />
        <div className="upload-icon">✍️</div>
        <div className="upload-text">{t.uploadArea}</div>
        <div className="upload-hint">{t.uploadOr} — {t.uploadHint}</div>
      </div>

      {/* Preview of selected file */}
      {previewUrl && (
        <div className="signature-preview">
          <div className="signature-preview-label">{t.preview}</div>
          <img src={previewUrl} alt="preview" />
        </div>
      )}

      {/* Signer info */}
      <div className="sig-name-group">
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">{t.signerName}</label>
          <input
            className="form-input"
            placeholder={t.namePlaceholder}
            value={signerName}
            onChange={e => setSignerName(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">{t.signerTitle}</label>
          <input
            className="form-input"
            placeholder={t.titlePlaceholder}
            value={signerTitle}
            onChange={e => setSignerTitle(e.target.value)}
          />
        </div>
      </div>

      <div className="signature-actions" style={{ marginTop: 20 }}>
        <button
          className="btn-upload"
          onClick={handleUpload}
          disabled={!file || !selectedTemplateId || uploading}
        >
          {uploading ? t.uploading : t.upload}
        </button>
      </div>
    </div>
  );
};

export default SignatureUpload;
