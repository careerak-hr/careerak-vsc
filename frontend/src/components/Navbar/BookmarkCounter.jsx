import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useBookmarkCount } from '../../hooks/useBookmarkCount';
import InteractiveElement from '../InteractiveElement';
import './BookmarkCounter.css';

/**
 * مكون عداد الوظائف المحفوظة في Navbar
 * يعرض عدد الوظائف المحفوظة مع badge
 * قابل للنقر للانتقال إلى صفحة الوظائف المحفوظة
 */
const BookmarkCounter = () => {
  const navigate = useNavigate();
  const { language } = useApp();
  const { count, loading } = useBookmarkCount();

  // النصوص حسب اللغة
  const labels = {
    ar: {
      title: 'الوظائف المحفوظة',
      ariaLabel: `الوظائف المحفوظة (${count})`
    },
    en: {
      title: 'Bookmarked Jobs',
      ariaLabel: `Bookmarked Jobs (${count})`
    },
    fr: {
      title: 'Emplois Sauvegardés',
      ariaLabel: `Emplois Sauvegardés (${count})`
    }
  };

  const text = labels[language] || labels.en;

  const handleClick = () => {
    navigate('/bookmarked-jobs');
  };

  // لا نعرض العداد إذا كان العدد 0 وليس في حالة تحميل
  const shouldShowBadge = count > 0 || loading;

  return (
    <InteractiveElement
      as="button"
      variant="icon"
      onClick={handleClick}
      className="bookmark-counter-btn"
      aria-label={text.ariaLabel}
      title={text.title}
    >
      {/* أيقونة القلب */}
      <div className="bookmark-counter-icon-wrapper">
        <Heart 
          size={20} 
          fill={count > 0 ? 'currentColor' : 'none'}
          className={`bookmark-counter-icon ${count > 0 ? 'has-bookmarks' : ''}`}
        />
        
        {/* Badge العداد */}
        {shouldShowBadge && (
          <span 
            className={`bookmark-counter-badge ${loading ? 'loading' : ''}`}
            aria-live="polite"
            aria-atomic="true"
          >
            {loading ? '...' : count}
          </span>
        )}
      </div>
    </InteractiveElement>
  );
};

export default BookmarkCounter;
