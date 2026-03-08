import React from 'react';
import { Grid, List } from 'lucide-react';
import './ViewToggle.css';

/**
 * Component to toggle between grid and list views
 * Requirements: 1.1, 1.2
 */
const ViewToggle = ({ view, onToggle }) => {
  return (
    <div className="view-toggle-container">
      <button
        className={`view-toggle-btn ${view === 'grid' ? 'active' : ''}`}
        onClick={() => onToggle('grid')}
        title="Grid View"
        aria-label="Switch to Grid View"
      >
        <Grid size={20} />
      </button>
      <button
        className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`}
        onClick={() => onToggle('list')}
        title="List View"
        aria-label="Switch to List View"
      >
        <List size={20} />
      </button>
    </div>
  );
};

export default ViewToggle;
