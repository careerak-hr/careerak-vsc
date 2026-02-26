import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '../context/AnimationContext';
import './KeyboardShortcutsModal.css';

/**
 * KeyboardShortcutsModal Component
 * 
 * Displays a modal with all available keyboard shortcuts
 * Respects prefers-reduced-motion setting
 * 
 * Props:
 * - isOpen: Boolean to control modal visibility (required)
 * - onClose: Callback when modal is closed (required)
 * - shortcuts: Array of shortcut objects { keys, description, category } (required)
 * - language: Current language ('ar', 'en', 'fr', default: 'en')
 * 
 * Usage:
 * <KeyboardShortcutsModal 
 *   isOpen={showShortcuts} 
 *   onClose={() => setShowShortcuts(false)}
 *   shortcuts={shortcuts}
 *   language={language}
 * />
 */
const KeyboardShortcutsModal = ({ 
  isOpen, 
  onClose, 
  shortcuts = [],
  language = 'en'
}) => {
  const { shouldAnimate } = useAnimation();

  // Translations
  const translations = {
    ar: {
      title: 'اختصارات لوحة المفاتيح',
      close: 'إغلاق',
      navigation: 'التنقل',
      actions: 'الإجراءات',
      general: 'عام'
    },
    en: {
      title: 'Keyboard Shortcuts',
      close: 'Close',
      navigation: 'Navigation',
      actions: 'Actions',
      general: 'General'
    },
    fr: {
      title: 'Raccourcis Clavier',
      close: 'Fermer',
      navigation: 'Navigation',
      actions: 'Actions',
      general: 'Général'
    }
  };

  const t = translations[language] || translations.en;

  // Animation variants
  const overlayVariants = shouldAnimate ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  } : {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = shouldAnimate ? {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  } : {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {});

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="shortcuts-modal-overlay"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="shortcuts-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-modal-title"
          >
            {/* Header */}
            <div className="shortcuts-modal-header">
              <h2 id="shortcuts-modal-title" className="shortcuts-modal-title">
                {t.title}
              </h2>
              <button
                onClick={onClose}
                className="shortcuts-modal-close-btn"
                aria-label={t.close}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="shortcuts-modal-content">
              {Object.entries(groupedShortcuts).map(([category, items]) => (
                <div key={category} className="shortcuts-category">
                  <h3 className="shortcuts-category-title">
                    {t[category] || category}
                  </h3>
                  <div className="shortcuts-list">
                    {items.map((shortcut, index) => (
                      <div key={index} className="shortcut-item">
                        <div className="shortcut-keys">
                          {shortcut.keys.split('+').map((key, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && <span className="shortcut-plus">+</span>}
                              <kbd className="shortcut-key">{key}</kbd>
                            </React.Fragment>
                          ))}
                        </div>
                        <div className="shortcut-description">
                          {shortcut.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="shortcuts-modal-footer">
              <p className="shortcuts-modal-hint">
                {language === 'ar' ? 'اضغط ESC أو ? للإغلاق' :
                 language === 'fr' ? 'Appuyez sur ESC ou ? pour fermer' :
                 'Press ESC or ? to close'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcutsModal;
