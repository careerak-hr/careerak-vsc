/**
 * KeyboardShortcutsHelp Component
 * 
 * Displays available keyboard shortcuts for the application form.
 * 
 * Requirements: 9.1-9.10
 */

import React, { useRef, useEffect } from 'react';
import { useFocusTrap } from '../../hooks/useFormKeyboardNavigation';
import './KeyboardShortcutsHelp.css';

function KeyboardShortcutsHelp({ isOpen, onClose, language = 'en' }) {
  const modalRef = useRef(null);
  
  // Trap focus in modal
  useFocusTrap(modalRef, isOpen, onClose);

  // Translations
  const translations = {
    ar: {
      title: 'اختصارات لوحة المفاتيح',
      close: 'إغلاق',
      navigation: 'التنقل',
      actions: 'الإجراءات',
      lists: 'القوائم',
      files: 'الملفات',
      shortcuts: {
        nextStep: 'الخطوة التالية',
        previousStep: 'الخطوة السابقة',
        saveDraft: 'حفظ المسودة',
        submit: 'إرسال الطلب',
        cancel: 'إلغاء',
        addEntry: 'إضافة إدخال جديد',
        removeEntry: 'حذف الإدخال',
        selectFiles: 'اختيار الملفات',
        removeFile: 'حذف الملف',
        help: 'عرض المساعدة'
      },
      keys: {
        ctrlEnter: 'Ctrl + Enter',
        altN: 'Alt + N',
        altP: 'Alt + P',
        ctrlS: 'Ctrl + S',
        escape: 'Escape',
        altA: 'Alt + A',
        delete: 'Delete / Backspace',
        enterSpace: 'Enter / Space',
        questionMark: '?'
      }
    },
    en: {
      title: 'Keyboard Shortcuts',
      close: 'Close',
      navigation: 'Navigation',
      actions: 'Actions',
      lists: 'Lists',
      files: 'Files',
      shortcuts: {
        nextStep: 'Next step',
        previousStep: 'Previous step',
        saveDraft: 'Save draft',
        submit: 'Submit application',
        cancel: 'Cancel',
        addEntry: 'Add new entry',
        removeEntry: 'Remove entry',
        selectFiles: 'Select files',
        removeFile: 'Remove file',
        help: 'Show help'
      },
      keys: {
        ctrlEnter: 'Ctrl + Enter',
        altN: 'Alt + N',
        altP: 'Alt + P',
        ctrlS: 'Ctrl + S',
        escape: 'Escape',
        altA: 'Alt + A',
        delete: 'Delete / Backspace',
        enterSpace: 'Enter / Space',
        questionMark: '?'
      }
    },
    fr: {
      title: 'Raccourcis clavier',
      close: 'Fermer',
      navigation: 'Navigation',
      actions: 'Actions',
      lists: 'Listes',
      files: 'Fichiers',
      shortcuts: {
        nextStep: 'Étape suivante',
        previousStep: 'Étape précédente',
        saveDraft: 'Enregistrer le brouillon',
        submit: 'Soumettre la candidature',
        cancel: 'Annuler',
        addEntry: 'Ajouter une entrée',
        removeEntry: 'Supprimer l\'entrée',
        selectFiles: 'Sélectionner des fichiers',
        removeFile: 'Supprimer le fichier',
        help: 'Afficher l\'aide'
      },
      keys: {
        ctrlEnter: 'Ctrl + Entrée',
        altN: 'Alt + N',
        altP: 'Alt + P',
        ctrlS: 'Ctrl + S',
        escape: 'Échap',
        altA: 'Alt + A',
        delete: 'Suppr / Retour',
        enterSpace: 'Entrée / Espace',
        questionMark: '?'
      }
    }
  };

  const t = translations[language] || translations.en;

  if (!isOpen) return null;

  return (
    <div 
      className="keyboard-shortcuts-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div 
        ref={modalRef}
        className="keyboard-shortcuts-modal" 
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="shortcuts-header">
          <h2 id="shortcuts-title">{t.title}</h2>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            aria-label={t.close}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="shortcuts-content">
          {/* Navigation */}
          <section className="shortcuts-section">
            <h3>{t.navigation}</h3>
            <dl className="shortcuts-list">
              <div className="shortcut-item">
                <dt className="shortcut-key">
                  <kbd>{t.keys.altN}</kbd>
                </dt>
                <dd className="shortcut-description">{t.shortcuts.nextStep}</dd>
              </div>
              <div className="shortcut-item">
                <dt className="shortcut-key">
                  <kbd>{t.keys.altP}</kbd>
                </dt>
                <dd className="shortcut-description">{t.shortcuts.previousStep}</dd>
              </div>
            </dl>
          </section>

          {/* Actions */}
          <section className="shortcuts-section">
            <h3>{t.actions}</h3>
            <dl className="shortcuts-list">
              <div className="shortcut-item">
                <dt className="shortcut-key">
                  <kbd>{t.keys.ctrlS}</kbd>
                </dt>
                <dd className="shortcut-description">{t.shortcuts.saveDraft}</dd>
              </div>
              <div className="shortcut-item">
                <dt className="shortcut-key">
                  <kbd>{t.keys.ctrlEnter}</kbd>
                </dt>
                <dd className="shortcut-description">{t.shortcuts.submit}</dd>
              </div>
              <div className="shortcut-item">
                <dt className="shortcut-key">
                  <kbd>{t.keys.escape}</kbd>
                </dt>
                <dd className="shortcut-description">{t.shortcuts.cancel}</dd>
              </div>
            </dl>
          </section>

          {/* Lists */}
          <section className="shortcuts-section">
            <h3>{t.lists}</h3>
            <dl className="shortcuts-list">
              <div className="shortcut-item">
                <dt className="shortcut-key">
                  <kbd>{t.keys.altA}</kbd>
                </dt>
                <dd className="shortcut-description">{t.shortcuts.addEntry}</dd>
              </div>
              <div className="shortcut-item">
                <dt className="shortcut-key">
                  <kbd>{t.keys.delete}</kbd>
                </dt>
                <dd className="shortcut-description">{t.shortcuts.removeEntry}</dd>
              </div>
            </dl>
          </section>

          {/* Files */}
          <section className="shortcuts-section">
            <h3>{t.files}</h3>
            <dl className="shortcuts-list">
              <div className="shortcut-item">
                <dt className="shortcut-key">
                  <kbd>{t.keys.enterSpace}</kbd>
                </dt>
                <dd className="shortcut-description">{t.shortcuts.selectFiles}</dd>
              </div>
              <div className="shortcut-item">
                <dt className="shortcut-key">
                  <kbd>{t.keys.delete}</kbd>
                </dt>
                <dd className="shortcut-description">{t.shortcuts.removeFile}</dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="shortcuts-footer">
          <p className="shortcuts-hint">
            {t.keys.questionMark} - {t.shortcuts.help}
          </p>
        </div>
      </div>
    </div>
  );
}

export default KeyboardShortcutsHelp;
