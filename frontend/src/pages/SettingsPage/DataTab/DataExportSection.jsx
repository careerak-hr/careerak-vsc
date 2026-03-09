import React, { useState } from 'react';
import './DataExportSection.css';

const DataExportSection = ({ onExportRequest, language }) => {
    const [selectedDataTypes, setSelectedDataTypes] = useState([]);
    const [selectedFormat, setSelectedFormat] = useState('json');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const translations = {
        ar: {
            title: 'تصدير البيانات',
            description: 'قم بتنزيل نسخة من بياناتك الشخصية (GDPR)',
            selectData: 'اختر البيانات المراد تصديرها',
            allData: 'جميع البيانات',
            profile: 'الملف الشخصي',
            activity: 'سجل النشاط',
            messages: 'الرسائل',
            applications: 'الطلبات',
            courses: 'الدورات',
            selectFormat: 'اختر التنسيق',
            json: 'JSON',
            csv: 'CSV',
            pdf: 'PDF',
            requestExport: 'طلب التصدير',
            requesting: 'جاري الطلب...',
            note: 'ملاحظة: قد يستغرق التصدير حتى 48 ساعة للملفات الكبيرة',
            selectAtLeastOne: 'يرجى اختيار نوع بيانات واحد على الأقل'
        },
        en: {
            title: 'Data Export',
            description: 'Download a copy of your personal data (GDPR)',
            selectData: 'Select data to export',
            allData: 'All Data',
            profile: 'Profile',
            activity: 'Activity History',
            messages: 'Messages',
            applications: 'Applications',
            courses: 'Courses',
            selectFormat: 'Select format',
            json: 'JSON',
            csv: 'CSV',
            pdf: 'PDF',
            requestExport: 'Request Export',
            requesting: 'Requesting...',
            note: 'Note: Export may take up to 48 hours for large files',
            selectAtLeastOne: 'Please select at least one data type'
        },
        fr: {
            title: 'Exportation de données',
            description: 'Téléchargez une copie de vos données personnelles (RGPD)',
            selectData: 'Sélectionner les données à exporter',
            allData: 'Toutes les données',
            profile: 'Profil',
            activity: 'Historique d\'activité',
            messages: 'Messages',
            applications: 'Candidatures',
            courses: 'Cours',
            selectFormat: 'Sélectionner le format',
            json: 'JSON',
            csv: 'CSV',
            pdf: 'PDF',
            requestExport: 'Demander l\'exportation',
            requesting: 'Demande en cours...',
            note: 'Remarque: L\'exportation peut prendre jusqu\'à 48 heures pour les gros fichiers',
            selectAtLeastOne: 'Veuillez sélectionner au moins un type de données'
        }
    };

    const t = translations[language] || translations.en;

    const dataTypes = [
        { value: 'profile', label: t.profile, icon: '👤' },
        { value: 'activity', label: t.activity, icon: '📊' },
        { value: 'messages', label: t.messages, icon: '💬' },
        { value: 'applications', label: t.applications, icon: '📝' },
        { value: 'courses', label: t.courses, icon: '📚' }
    ];

    const formats = [
        { value: 'json', label: t.json, icon: '{ }' },
        { value: 'csv', label: t.csv, icon: '📄' },
        { value: 'pdf', label: t.pdf, icon: '📕' }
    ];

    const handleDataTypeToggle = (type) => {
        if (type === 'all') {
            if (selectedDataTypes.length === dataTypes.length) {
                setSelectedDataTypes([]);
            } else {
                setSelectedDataTypes(dataTypes.map(dt => dt.value));
            }
        } else {
            setSelectedDataTypes(prev => 
                prev.includes(type)
                    ? prev.filter(t => t !== type)
                    : [...prev, type]
            );
        }
    };

    const handleSubmit = async () => {
        if (selectedDataTypes.length === 0) {
            alert(t.selectAtLeastOne);
            return;
        }

        setIsSubmitting(true);
        try {
            await onExportRequest({
                dataTypes: selectedDataTypes,
                format: selectedFormat
            });
            // Reset form
            setSelectedDataTypes([]);
            setSelectedFormat('json');
        } finally {
            setIsSubmitting(false);
        }
    };

    const allSelected = selectedDataTypes.length === dataTypes.length;

    return (
        <section className="data-export-section">
            <div className="section-header">
                <h3 className="section-title">📦 {t.title}</h3>
                <p className="section-description">{t.description}</p>
            </div>

            <div className="export-form">
                {/* Data Types Selection */}
                <div className="form-group">
                    <label className="form-label">{t.selectData}</label>
                    
                    {/* Select All */}
                    <label className="data-type-checkbox">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => handleDataTypeToggle('all')}
                        />
                        <span className="checkbox-label">
                            <span className="checkbox-icon">📦</span>
                            <span className="checkbox-text">{t.allData}</span>
                        </span>
                    </label>

                    {/* Individual Data Types */}
                    <div className="data-types-grid">
                        {dataTypes.map(({ value, label, icon }) => (
                            <label key={value} className="data-type-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedDataTypes.includes(value)}
                                    onChange={() => handleDataTypeToggle(value)}
                                />
                                <span className="checkbox-label">
                                    <span className="checkbox-icon">{icon}</span>
                                    <span className="checkbox-text">{label}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Format Selection */}
                <div className="form-group">
                    <label className="form-label">{t.selectFormat}</label>
                    <div className="format-options">
                        {formats.map(({ value, label, icon }) => (
                            <label key={value} className="format-option">
                                <input
                                    type="radio"
                                    name="format"
                                    value={value}
                                    checked={selectedFormat === value}
                                    onChange={(e) => setSelectedFormat(e.target.value)}
                                />
                                <span className="format-label">
                                    <span className="format-icon">{icon}</span>
                                    <span className="format-text">{label}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || selectedDataTypes.length === 0}
                    className="export-button"
                >
                    {isSubmitting ? t.requesting : t.requestExport}
                </button>

                {/* Note */}
                <p className="export-note">ℹ️ {t.note}</p>
            </div>
        </section>
    );
};

export default DataExportSection;
