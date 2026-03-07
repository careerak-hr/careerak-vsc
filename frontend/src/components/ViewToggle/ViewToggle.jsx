import React from 'react';
import { Grid, List } from 'lucide-react';
import './ViewToggle.css';

/**
 * مكون زر التبديل بين عرض Grid و List
 * @param {Object} props
 * @param {string} props.view - نوع العرض الحالي ('grid' أو 'list')
 * @param {function} props.onToggle - دالة التبديل
 * @param {string} props.className - CSS classes إضافية
 */
function ViewToggle({ view, onToggle, className = '' }) {
  return (
    <div className={`view-toggle ${className}`}>
      <button
        type="button"
        className={`view-toggle-btn ${view === 'grid' ? 'active' : ''}`}
        onClick={() => view !== 'grid' && onToggle()}
        aria-label="عرض شبكي"
        title="عرض شبكي"
      >
        <Grid size={20} />
      </button>
      
      <button
        type="button"
        className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`}
        onClick={() => view !== 'list' && onToggle()}
        aria-label="عرض قائمة"
        title="عرض قائمة"
      >
        <List size={20} />
      </button>
    </div>
  );
}

export default ViewToggle;
