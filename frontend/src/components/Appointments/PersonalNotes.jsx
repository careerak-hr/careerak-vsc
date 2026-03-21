import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './PersonalNotes.css';

/**
 * PersonalNotes
 * مكون الملاحظات الشخصية للباحثين عن عمل
 * هذه الملاحظات خاصة تماماً بالباحث - لا تظهر للشركة أو أي مستخدم آخر
 *
 * Requirements: User Story 7 - نظام ملاحظات شخصية
 */

const t = {
  ar: {
    title: 'ملاحظاتي الشخصية',
    subtitle: 'هذه الملاحظات خاصة بك فقط ولا يراها أحد غيرك',
    addNote: 'إضافة ملاحظة',
    editNote: 'تعديل الملاحظة',
    placeholder: 'اكتب ملاحظتك الشخصية هنا... (تحضير للمقابلة، أسئلة تريد طرحها، ملاحظات مهمة)',
    save: 'حفظ',
    saving: 'جاري الحفظ...',
    cancel: 'إلغاء',
    edit: 'تعديل',
    delete: 'حذف',
    confirmDelete: 'هل أنت متأكد من حذف هذه الملاحظة؟',
    loading: 'جاري التحميل...',
    noNotes: 'لا توجد ملاحظات شخصية بعد',
    noNotesHint: 'أضف ملاحظاتك التحضيرية للمقابلة',
    errorLoad: 'فشل تحميل الملاحظات',
    errorSave: 'فشل حفظ الملاحظة',
    errorDelete: 'فشل حذف الملاحظة',
    successAdd: 'تمت إضافة الملاحظة بنجاح',
    successEdit: 'تم تعديل الملاحظة بنجاح',
    successDelete: 'تم حذف الملاحظة بنجاح',
    privateLabel: '🔒 خاصة',
    updatedAt: 'آخر تعديل',
    createdAt: 'تاريخ الإضافة',
    charCount: 'حرف',
  },
  en: {
    title: 'My Personal Notes',
    subtitle: 'These notes are private to you only — no one else can see them',
    addNote: 'Add Note',
    editNote: 'Edit Note',
    placeholder: 'Write your personal note here... (interview prep, questions to ask, important reminders)',
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this note?',
    loading: 'Loading...',
    noNotes: 'No personal notes yet',
    noNotesHint: 'Add your interview preparation notes',
    errorLoad: 'Failed to load notes',
    errorSave: 'Failed to save note',
    errorDelete: 'Failed to delete note',
    successAdd: 'Note added successfully',
    successEdit: 'Note updated successfully',
    successDelete: 'Note deleted successfully',
    privateLabel: '🔒 Private',
    updatedAt: 'Last updated',
    createdAt: 'Added on',
    charCount: 'chars',
  },
  fr: {
    title: 'Mes notes personnelles',
    subtitle: 'Ces notes sont privées — personne d\'autre ne peut les voir',
    addNote: 'Ajouter une note',
    editNote: 'Modifier la note',
    placeholder: 'Écrivez votre note personnelle ici... (préparation à l\'entretien, questions à poser)',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    cancel: 'Annuler',
    edit: 'Modifier',
    delete: 'Supprimer',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer cette note ?',
    loading: 'Chargement...',
    noNotes: 'Aucune note personnelle pour l\'instant',
    noNotesHint: 'Ajoutez vos notes de préparation à l\'entretien',
    errorLoad: 'Échec du chargement des notes',
    errorSave: 'Échec de l\'enregistrement',
    errorDelete: 'Échec de la suppression',
    successAdd: 'Note ajoutée avec succès',
    successEdit: 'Note modifiée avec succès',
    successDelete: 'Note supprimée avec succès',
    privateLabel: '🔒 Privée',
    updatedAt: 'Dernière modification',
    createdAt: 'Ajoutée le',
    charCount: 'car.',
  },
};

const API_BASE = import.meta.env.VITE_API_URL || '';
const MAX_CHARS = 10000;

const PersonalNotes = ({ appointmentId }) => {
  const { language, token } = useApp();
  const tr = t[language] || t.ar;
  const isRTL = language === 'ar';
  const fontFamily =
    language === 'ar'
      ? 'Amiri, Cairo, serif'
      : language === 'fr'
      ? 'EB Garamond, serif'
      : 'Cormorant Garamond, serif';

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null); // null = add mode, note object = edit mode
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchNotes = useCallback(async () => {
    if (!appointmentId || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/appointments/${appointmentId}/personal-notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotes(data.notes || []);
      } else {
        setMsg({ text: tr.errorLoad, type: 'error' });
      }
    } catch {
      setMsg({ text: tr.errorLoad, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [appointmentId, token, tr.errorLoad]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const openAddForm = () => {
    setEditingNote(null);
    setContent('');
    setMsg({ text: '', type: '' });
    setShowForm(true);
  };

  const openEditForm = (note) => {
    setEditingNote(note);
    setContent(note.content);
    setMsg({ text: '', type: '' });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingNote(null);
    setContent('');
    setMsg({ text: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    setMsg({ text: '', type: '' });

    try {
      const isEdit = !!editingNote;
      const url = isEdit
        ? `${API_BASE}/api/appointments/${appointmentId}/personal-notes/${editingNote._id}`
        : `${API_BASE}/api/appointments/${appointmentId}/personal-notes`;

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || tr.errorSave);

      setMsg({ text: isEdit ? tr.successEdit : tr.successAdd, type: 'success' });

      if (isEdit) {
        setNotes((prev) =>
          prev.map((n) => (n._id === editingNote._id ? data.note : n))
        );
      } else {
        setNotes((prev) => [data.note, ...prev]);
      }

      setTimeout(() => closeForm(), 1200);
    } catch (err) {
      setMsg({ text: err.message || tr.errorSave, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm(tr.confirmDelete)) return;
    setDeletingId(noteId);
    try {
      const res = await fetch(
        `${API_BASE}/api/appointments/${appointmentId}/personal-notes/${noteId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || tr.errorDelete);
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      setMsg({ text: tr.successDelete, type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 2500);
    } catch (err) {
      setMsg({ text: err.message || tr.errorDelete, type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(
      language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    );

  return (
    <div
      className={`pn-container${isRTL ? ' pn-rtl' : ' pn-ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ fontFamily }}
    >
      {/* Header */}
      <div className="pn-header">
        <div className="pn-header-text">
          <h3 className="pn-title">
            📓 {tr.title}
            <span className="pn-private-badge">{tr.privateLabel}</span>
          </h3>
          <p className="pn-subtitle">{tr.subtitle}</p>
        </div>
        {!showForm && (
          <button className="pn-btn pn-btn--primary" onClick={openAddForm}>
            + {tr.addNote}
          </button>
        )}
      </div>

      {/* Global message */}
      {msg.text && !showForm && (
        <div className={`pn-msg pn-msg--${msg.type}`}>{msg.text}</div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <form className="pn-form" onSubmit={handleSubmit}>
          <div className="pn-form-title">
            {editingNote ? tr.editNote : tr.addNote}
          </div>

          <div className="pn-field">
            <textarea
              className="pn-textarea"
              placeholder={tr.placeholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              maxLength={MAX_CHARS}
              autoFocus
            />
            <div className="pn-char-count">
              {content.length} / {MAX_CHARS} {tr.charCount}
            </div>
          </div>

          {msg.text && (
            <div className={`pn-msg pn-msg--${msg.type}`}>{msg.text}</div>
          )}

          <div className="pn-form-actions">
            <button
              type="submit"
              className="pn-btn pn-btn--primary"
              disabled={saving || !content.trim()}
            >
              {saving ? tr.saving : tr.save}
            </button>
            <button
              type="button"
              className="pn-btn pn-btn--ghost"
              onClick={closeForm}
              disabled={saving}
            >
              {tr.cancel}
            </button>
          </div>
        </form>
      )}

      {/* Notes List */}
      <div className="pn-list">
        {loading ? (
          <div className="pn-loading">{tr.loading}</div>
        ) : notes.length === 0 ? (
          <div className="pn-empty">
            <div className="pn-empty-icon">📝</div>
            <div className="pn-empty-text">{tr.noNotes}</div>
            <div className="pn-empty-hint">{tr.noNotesHint}</div>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note._id} className="pn-note-card">
              <div className="pn-note-content">{note.content}</div>
              <div className="pn-note-footer">
                <span className="pn-note-date">
                  {note.updatedAt !== note.createdAt
                    ? `${tr.updatedAt}: ${formatDate(note.updatedAt)}`
                    : `${tr.createdAt}: ${formatDate(note.createdAt)}`}
                </span>
                <div className="pn-note-actions">
                  <button
                    className="pn-action-btn pn-action-btn--edit"
                    onClick={() => openEditForm(note)}
                    title={tr.edit}
                    aria-label={tr.edit}
                  >
                    ✏️
                  </button>
                  <button
                    className="pn-action-btn pn-action-btn--delete"
                    onClick={() => handleDelete(note._id)}
                    disabled={deletingId === note._id}
                    title={tr.delete}
                    aria-label={tr.delete}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PersonalNotes;
