import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { emitBookmarkCountChange } from '../../hooks/useBookmarkCount';
import './BookmarkButton.css';

/**
 * مكون زر حفظ الوظيفة (Bookmark)
 * يعرض أيقونة قلب مع animation عند الحفظ/الإزالة
 * 
 * @param {Object} props
 * @param {string} props.jobId - معرف الوظيفة
 * @param {boolean} props.isBookmarked - هل الوظيفة محفوظة
 * @param {Function} props.onToggle - دالة تبديل حالة الحفظ
 * @param {string} props.size - حجم الأيقونة (small, medium, large)
 * @param {string} props.variant - نوع الزر (icon, button)
 * @param {boolean} props.showLabel - عرض النص بجانب الأيقونة
 * @param {boolean} props.disabled - تعطيل الزر
 */
const BookmarkButton = ({
  jobId,
  isBookmarked = false,
  onToggle,
  size = 'medium',
  variant = 'icon',
  showLabel = false,
  disabled = false
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // أحجام الأيقونة
  const iconSizes = {
    small: 16,
    medium: 18,
    large: 20
  };

  const handleClick = async (e) => {
    e.stopPropagation();
    
    if (disabled || isLoading) return;

    // تشغيل animation
    setIsAnimating(true);
    setIsLoading(true);

    try {
      // استدعاء دالة التبديل
      const result = await onToggle?.(jobId);
      
      // تحديث العداد في Navbar
      if (result !== undefined) {
        // إذا كانت الدالة ترجع true/false
        emitBookmarkCountChange(result ? 'add' : 'remove');
      } else {
        // إذا لم ترجع شيء، نفترض أنها تبديل
        emitBookmarkCountChange(isBookmarked ? 'remove' : 'add');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsLoading(false);
      
      // إيقاف animation بعد 600ms
      setTimeout(() => {
        setIsAnimating(false);
      }, 600);
    }
  };

  // النصوص
  const label = isBookmarked ? 'محفوظة' : 'حفظ';
  const ariaLabel = isBookmarked ? 'إزالة من المفضلة' : 'حفظ في المفضلة';
  const title = isBookmarked ? 'إزالة من المفضلة' : 'حفظ في المفضلة';

  // الأنماط الديناميكية
  const buttonClass = [
    'bookmark-button',
    `bookmark-button-${variant}`,
    `bookmark-button-${size}`,
    isBookmarked && 'bookmarked',
    isAnimating && 'animating',
    isLoading && 'loading',
    disabled && 'disabled'
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClass}
      onClick={handleClick}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled || isLoading}
      type="button"
    >
      {/* أيقونة القلب */}
      <Heart 
        size={iconSizes[size]} 
        fill={isBookmarked ? 'currentColor' : 'none'}
        className="bookmark-icon"
      />

      {/* النص (اختياري) */}
      {showLabel && (
        <span className="bookmark-label">{label}</span>
      )}

      {/* دوائر Animation */}
      {isAnimating && (
        <>
          <span className="bookmark-ripple bookmark-ripple-1" />
          <span className="bookmark-ripple bookmark-ripple-2" />
          <span className="bookmark-ripple bookmark-ripple-3" />
        </>
      )}
    </button>
  );
};

export default BookmarkButton;
