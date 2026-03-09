import React, { useState, useEffect } from 'react';
import './UndoButton.css';

/**
 * Undo button component with countdown timer
 */
const UndoButton = ({ 
  canUndo, 
  onUndo, 
  getTimeRemaining,
  lastChangeDescription 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isUndoing, setIsUndoing] = useState(false);

  // Update countdown timer
  useEffect(() => {
    if (!canUndo) {
      setTimeRemaining(0);
      return;
    }

    const updateTimer = () => {
      const remaining = getTimeRemaining();
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);

    return () => clearInterval(interval);
  }, [canUndo, getTimeRemaining]);

  const handleUndo = async () => {
    if (!canUndo || isUndoing) return;

    try {
      setIsUndoing(true);
      await onUndo();
    } catch (error) {
      console.error('Undo failed:', error);
    } finally {
      setIsUndoing(false);
    }
  };

  // Format time remaining
  const formatTime = (ms) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}ث`;
  };

  if (!canUndo) return null;

  return (
    <div className="undo-button-container" role="status" aria-live="polite">
      <button
        className="undo-button"
        onClick={handleUndo}
        disabled={isUndoing || timeRemaining === 0}
        aria-label={`تراجع عن ${lastChangeDescription || 'التغيير الأخير'}`}
      >
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 7v6h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text">
          {isUndoing ? 'جاري التراجع...' : 'تراجع'}
        </span>
        {!isUndoing && timeRemaining > 0 && (
          <span className="timer" aria-label={`الوقت المتبقي: ${formatTime(timeRemaining)}`}>
            ({formatTime(timeRemaining)})
          </span>
        )}
      </button>
      {lastChangeDescription && (
        <span className="description">{lastChangeDescription}</span>
      )}
    </div>
  );
};

export default UndoButton;
