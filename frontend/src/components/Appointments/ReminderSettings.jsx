import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './ReminderSettings.css';

const t = {
  ar: {
    title: 'إعدادات التذكيرات',
    subtitle: 'خصّص أوقات التذكير قبل مواعيدك',
    defaults: 'التذكيرات الافتراضية',
    custom: 'تذكيرات مخصصة',
    add: 'إضافة تذكير',
    minutesBefore: 'دقيقة قبل الموعد',
    save: 'حفظ',
    saved: 'تم الحفظ ✓',
    remove: 'حذف',
    placeholder: 'عدد الدقائق',
    defaults24h: 'قبل 24 ساعة (1440 دقيقة)',
    defaults1h: 'قبل ساعة (60 دقيقة)',
    error: 'أدخل رقماً موجباً',
  },
  en: {
    title: 'Reminder Settings',
    subtitle: 'Customize reminder times before your appointments',
    defaults: 'Default Reminders',
    custom: 'Custom Reminders',
    add: 'Add Reminder',
    minutesBefore: 'minutes before',
    save: 'Save',
    saved: 'Saved ✓',
    remove: 'Remove',
    placeholder: 'Minutes',
    defaults24h: '24 hours before (1440 min)',
    defaults1h: '1 hour before (60 min)',
    error: 'Enter a positive number',
  },
  fr: {
    title: 'Paramètres de rappel',
    subtitle: 'Personnalisez les rappels avant vos rendez-vous',
    defaults: 'Rappels par défaut',
    custom: 'Rappels personnalisés',
    add: 'Ajouter un rappel',
    minutesBefore: 'minutes avant',
    save: 'Enregistrer',
    saved: 'Enregistré ✓',
    remove: 'Supprimer',
    placeholder: 'Minutes',
    defaults24h: '24 heures avant (1440 min)',
    defaults1h: '1 heure avant (60 min)',
    error: 'Entrez un nombre positif',
  },
};

const API_BASE = import.meta.env.VITE_API_URL || '';

const ReminderSettings = ({ reminderId }) => {
  const { language, token } = useApp();
  const tr = t[language] || t.ar;
  const isRTL = language === 'ar';
  const fontFamily = language === 'ar' ? 'Amiri, Cairo, serif' : language === 'fr' ? 'EB Garamond, serif' : 'Cormorant Garamond, serif';

  const [customReminders, setCustomReminders] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAdd = () => {
    const val = parseInt(input, 10);
    if (!val || val <= 0) { setError(tr.error); return; }
    if (customReminders.includes(val)) { setInput(''); return; }
    setCustomReminders(prev => [...prev, val].sort((a, b) => b - a));
    setInput('');
    setError('');
  };

  const handleRemove = (val) => {
    setCustomReminders(prev => prev.filter(v => v !== val));
  };

  const handleSave = async () => {
    if (!reminderId) return;
    setSaving(true);
    try {
      await fetch(`${API_BASE}/api/reminders/${reminderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customReminders }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`rs-root${isRTL ? ' rs-rtl' : ' rs-ltr'}`} dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily }}>
      <h3 className="rs-title">{tr.title}</h3>
      <p className="rs-subtitle">{tr.subtitle}</p>

      <div className="rs-section">
        <h4 className="rs-section-title">{tr.defaults}</h4>
        <div className="rs-chip rs-chip--default">⏰ {tr.defaults24h}</div>
        <div className="rs-chip rs-chip--default">⏰ {tr.defaults1h}</div>
      </div>

      <div className="rs-section">
        <h4 className="rs-section-title">{tr.custom}</h4>
        <div className="rs-add-row">
          <input
            className="rs-input"
            type="number"
            min="1"
            value={input}
            onChange={e => { setInput(e.target.value); setError(''); }}
            placeholder={tr.placeholder}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <span className="rs-unit">{tr.minutesBefore}</span>
          <button className="rs-btn rs-btn--add" onClick={handleAdd}>{tr.add}</button>
        </div>
        {error && <p className="rs-error">{error}</p>}

        <div className="rs-chips">
          {customReminders.map(val => (
            <div key={val} className="rs-chip rs-chip--custom">
              ⏱ {val} {tr.minutesBefore}
              <button className="rs-chip-remove" onClick={() => handleRemove(val)} aria-label={tr.remove}>×</button>
            </div>
          ))}
        </div>
      </div>

      {reminderId && (
        <button className="rs-btn rs-btn--save" onClick={handleSave} disabled={saving}>
          {saved ? tr.saved : tr.save}
        </button>
      )}
    </div>
  );
};

export default ReminderSettings;
