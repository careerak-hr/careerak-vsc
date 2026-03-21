import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';

const translations = {
  ar: {
    title: 'محرر تصميم الشهادة',
    templateName: 'اسم القالب',
    layout: 'التخطيط',
    layoutClassic: 'كلاسيكي',
    layoutModern: 'عصري',
    layoutMinimal: 'بسيط',
    logoPosition: 'موضع الشعار',
    posTopLeft: 'أعلى اليسار',
    posTopCenter: 'أعلى الوسط',
    posTopRight: 'أعلى اليمين',
    posNone: 'بدون شعار',
    colors: 'الألوان',
    colorPrimary: 'الأساسي',
    colorSecondary: 'الثانوي',
    colorAccent: 'المميز',
    colorText: 'النص',
    colorBg: 'الخلفية',
    elements: 'العناصر المرئية',
    showLogo: 'إظهار الشعار',
    showSignature: 'إظهار التوقيع',
    showQRCode: 'إظهار QR Code',
    showBorder: 'إظهار الإطار',
    showDate: 'إظهار التاريخ',
    showCategory: 'إظهار التصنيف',
    setDefault: 'تعيين كافتراضي',
    save: 'حفظ القالب',
    saving: 'جاري الحفظ...',
    saved: 'تم الحفظ بنجاح',
    preview: 'معاينة الشهادة',
    previewName: 'محمد أحمد',
    previewCourse: 'دورة تطوير الويب',
    previewDate: 'تاريخ الإصدار',
    previewSignature: 'التوقيع',
    previewQR: 'QR',
    newTemplate: 'قالب جديد',
    selectTemplate: 'اختر قالباً',
    errorSave: 'حدث خطأ أثناء الحفظ',
  },
  en: {
    title: 'Certificate Design Editor',
    templateName: 'Template Name',
    layout: 'Layout',
    layoutClassic: 'Classic',
    layoutModern: 'Modern',
    layoutMinimal: 'Minimal',
    logoPosition: 'Logo Position',
    posTopLeft: 'Top Left',
    posTopCenter: 'Top Center',
    posTopRight: 'Top Right',
    posNone: 'No Logo',
    colors: 'Colors',
    colorPrimary: 'Primary',
    colorSecondary: 'Secondary',
    colorAccent: 'Accent',
    colorText: 'Text',
    colorBg: 'Background',
    elements: 'Visible Elements',
    showLogo: 'Show Logo',
    showSignature: 'Show Signature',
    showQRCode: 'Show QR Code',
    showBorder: 'Show Border',
    showDate: 'Show Date',
    showCategory: 'Show Category',
    setDefault: 'Set as Default',
    save: 'Save Template',
    saving: 'Saving...',
    saved: 'Saved successfully',
    preview: 'Certificate Preview',
    previewName: 'John Smith',
    previewCourse: 'Web Development Course',
    previewDate: 'Issue Date',
    previewSignature: 'Signature',
    previewQR: 'QR',
    newTemplate: 'New Template',
    selectTemplate: 'Select Template',
    errorSave: 'Error saving template',
  },
  fr: {
    title: 'Éditeur de Design de Certificat',
    templateName: 'Nom du Modèle',
    layout: 'Mise en Page',
    layoutClassic: 'Classique',
    layoutModern: 'Moderne',
    layoutMinimal: 'Minimal',
    logoPosition: 'Position du Logo',
    posTopLeft: 'Haut Gauche',
    posTopCenter: 'Haut Centre',
    posTopRight: 'Haut Droite',
    posNone: 'Sans Logo',
    colors: 'Couleurs',
    colorPrimary: 'Primaire',
    colorSecondary: 'Secondaire',
    colorAccent: 'Accent',
    colorText: 'Texte',
    colorBg: 'Fond',
    elements: 'Éléments Visibles',
    showLogo: 'Afficher Logo',
    showSignature: 'Afficher Signature',
    showQRCode: 'Afficher QR Code',
    showBorder: 'Afficher Bordure',
    showDate: 'Afficher Date',
    showCategory: 'Afficher Catégorie',
    setDefault: 'Définir par Défaut',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    saved: 'Enregistré avec succès',
    preview: 'Aperçu du Certificat',
    previewName: 'Jean Dupont',
    previewCourse: 'Cours de Développement Web',
    previewDate: "Date d'Émission",
    previewSignature: 'Signature',
    previewQR: 'QR',
    newTemplate: 'Nouveau Modèle',
    selectTemplate: 'Sélectionner un Modèle',
    errorSave: "Erreur lors de l'enregistrement",
  },
};

const defaultTemplate = {
  name: '',
  layout: 'classic',
  logoPosition: 'top-center',
  colors: {
    primary: '#304B60',
    secondary: '#E3DAD1',
    accent: '#D48161',
    text: '#304B60',
    background: '#FFFFFF',
  },
  elements: {
    showLogo: true,
    showSignature: true,
    showQRCode: true,
    showBorder: true,
    showDate: true,
    showCourseCategory: false,
  },
  isDefault: false,
};

const CertificateDesignEditor = ({ templates = [], onSave, onTemplatesChange }) => {
  const { language } = useApp();
  const t = translations[language] || translations.ar;
  const isRTL = language === 'ar';
  const fontFamily = language === 'ar' ? "'Amiri', 'Cairo', serif"
    : language === 'fr' ? "'EB Garamond', serif"
    : "'Cormorant Garamond', serif";

  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [form, setForm] = useState({ ...defaultTemplate, name: t.newTemplate });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const fontStyle = { fontFamily };

  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      const def = templates.find(t => t.isDefault) || templates[0];
      setSelectedTemplateId(def._id);
      setForm({
        name: def.name,
        layout: def.layout,
        logoPosition: def.logoPosition,
        colors: { ...defaultTemplate.colors, ...def.colors },
        elements: { ...defaultTemplate.elements, ...def.elements },
        isDefault: def.isDefault,
      });
    }
  }, [templates]);

  const selectTemplate = (tpl) => {
    setSelectedTemplateId(tpl._id);
    setForm({
      name: tpl.name,
      layout: tpl.layout,
      logoPosition: tpl.logoPosition,
      colors: { ...defaultTemplate.colors, ...tpl.colors },
      elements: { ...defaultTemplate.elements, ...tpl.elements },
      isDefault: tpl.isDefault,
    });
  };

  const newTemplate = () => {
    setSelectedTemplateId(null);
    setForm({ ...defaultTemplate, name: t.newTemplate });
  };

  const updateColor = (key, value) => {
    setForm(prev => ({ ...prev, colors: { ...prev.colors, [key]: value } }));
  };

  const updateElement = (key) => {
    setForm(prev => ({
      ...prev,
      elements: { ...prev.elements, [key]: !prev.elements[key] },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setAlert(null);
    try {
      const token = localStorage.getItem('token');
      const url = selectedTemplateId
        ? `${import.meta.env.VITE_API_URL}/api/certificates/management/templates/${selectedTemplateId}`
        : `${import.meta.env.VITE_API_URL}/api/certificates/management/templates`;
      const method = selectedTemplateId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t.errorSave);

      setAlert({ type: 'success', msg: t.saved });
      if (!selectedTemplateId) setSelectedTemplateId(data.template._id);
      if (onTemplatesChange) onTemplatesChange();
      if (onSave) onSave(data.template);
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally {
      setSaving(false);
    }
  };

  const colorFields = [
    { key: 'primary', label: t.colorPrimary },
    { key: 'secondary', label: t.colorSecondary },
    { key: 'accent', label: t.colorAccent },
    { key: 'text', label: t.colorText },
    { key: 'background', label: t.colorBg },
  ];

  const elementFields = [
    { key: 'showLogo', label: t.showLogo },
    { key: 'showSignature', label: t.showSignature },
    { key: 'showQRCode', label: t.showQRCode },
    { key: 'showBorder', label: t.showBorder },
    { key: 'showDate', label: t.showDate },
    { key: 'showCourseCategory', label: t.showCategory },
  ];

  const { colors, elements } = form;

  return (
    <div style={fontStyle}>
      {/* Template selector */}
      <div className="template-selector">
        <button className={`template-option ${!selectedTemplateId ? 'selected' : ''}`} onClick={newTemplate}>
          + {t.newTemplate}
        </button>
        {templates.map(tpl => (
          <button
            key={tpl._id}
            className={`template-option ${selectedTemplateId === tpl._id ? 'selected' : ''}`}
            onClick={() => selectTemplate(tpl)}
          >
            {tpl.name} {tpl.isDefault ? '★' : ''}
          </button>
        ))}
      </div>

      {alert && (
        <div className={`alert ${alert.type}`}>{alert.msg}</div>
      )}

      <div className="cert-design-editor">
        {/* Left: Controls */}
        <div>
          <div className="editor-panel">
            <h3 className="editor-panel-title">{t.title}</h3>

            {/* Template name */}
            <div className="form-group">
              <label className="form-label">{t.templateName}</label>
              <input
                className="form-input"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* Layout */}
            <div className="form-group">
              <label className="form-label">{t.layout}</label>
              <select
                className="form-select"
                value={form.layout}
                onChange={e => setForm(prev => ({ ...prev, layout: e.target.value }))}
              >
                <option value="classic">{t.layoutClassic}</option>
                <option value="modern">{t.layoutModern}</option>
                <option value="minimal">{t.layoutMinimal}</option>
              </select>
            </div>

            {/* Logo position */}
            <div className="form-group">
              <label className="form-label">{t.logoPosition}</label>
              <select
                className="form-select"
                value={form.logoPosition}
                onChange={e => setForm(prev => ({ ...prev, logoPosition: e.target.value }))}
              >
                <option value="top-left">{t.posTopLeft}</option>
                <option value="top-center">{t.posTopCenter}</option>
                <option value="top-right">{t.posTopRight}</option>
                <option value="none">{t.posNone}</option>
              </select>
            </div>

            {/* Colors */}
            <div className="form-group">
              <label className="form-label">{t.colors}</label>
              <div className="color-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {colorFields.map(({ key, label }) => (
                  <div className="color-item" key={key}>
                    <label>{label}</label>
                    <div className="color-input-wrap">
                      <input
                        type="color"
                        className="color-swatch"
                        value={colors[key]}
                        onChange={e => updateColor(key, e.target.value)}
                        title={label}
                      />
                      <input
                        className="color-hex"
                        value={colors[key]}
                        onChange={e => updateColor(key, e.target.value)}
                        maxLength={7}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Elements */}
            <div className="form-group">
              <label className="form-label">{t.elements}</label>
              <div className="toggle-grid">
                {elementFields.map(({ key, label }) => (
                  <div className="toggle-item" key={key}>
                    <span className="toggle-label">{label}</span>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={elements[key]}
                        onChange={() => updateElement(key)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Set default */}
            <div className="toggle-item" style={{ marginBottom: 16 }}>
              <span className="toggle-label">{t.setDefault}</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={() => setForm(prev => ({ ...prev, isDefault: !prev.isDefault }))}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <button className="btn-save" onClick={handleSave} disabled={saving}>
              {saving ? t.saving : t.save}
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="cert-preview-panel">
          <h3 className="cert-preview-title">{t.preview}</h3>
          <div
            className="cert-preview-frame"
            style={{ background: colors.background }}
          >
            <div
              className="cert-preview-inner"
              style={{ color: colors.text, direction: isRTL ? 'rtl' : 'ltr' }}
            >
              {elements.showBorder && (
                <div
                  className="cert-preview-border"
                  style={{ borderColor: colors.accent }}
                />
              )}

              {elements.showLogo && form.logoPosition !== 'none' && (
                <div
                  className="cert-preview-logo"
                  style={{
                    color: colors.primary,
                    textAlign: form.logoPosition === 'top-left' ? 'start' : form.logoPosition === 'top-right' ? 'end' : 'center',
                  }}
                >
                  Careerak
                </div>
              )}

              <div className="cert-preview-heading" style={{ color: colors.accent }}>
                CERTIFICATE OF COMPLETION
              </div>

              <div className="cert-preview-name" style={{ color: colors.primary }}>
                {t.previewName}
              </div>

              <div className="cert-preview-course-label">{isRTL ? 'أتم بنجاح دورة' : 'has successfully completed'}</div>
              <div className="cert-preview-course" style={{ color: colors.accent }}>
                {t.previewCourse}
              </div>

              <div className="cert-preview-footer">
                {elements.showSignature && (
                  <div className="cert-preview-sig">
                    <div className="cert-preview-sig-line" style={{ background: colors.text }} />
                    <div className="cert-preview-sig-name">{t.previewSignature}</div>
                  </div>
                )}

                {elements.showDate && (
                  <div className="cert-preview-date">
                    {t.previewDate}: {new Date().toLocaleDateString()}
                  </div>
                )}

                {elements.showQRCode && (
                  <div className="cert-preview-qr" style={{ background: colors.secondary }}>
                    {t.previewQR}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateDesignEditor;
