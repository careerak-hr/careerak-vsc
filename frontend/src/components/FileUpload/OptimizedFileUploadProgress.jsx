import React, { memo, useCallback } from 'react';
import { useThrottle } from '../../hooks/useThrottle';
import { rafSchedule } from '../../utils/performanceOptimization';

/**
 * Optimized file upload progress component
 * Uses throttling and RAF for smooth progress updates
 */
const OptimizedFileUploadProgress = memo(({
  fileId,
  fileName,
  progress,
  onCancel
}) => {
  // Throttle progress updates to avoid excessive re-renders
  const [displayProgress, setDisplayProgress] = React.useState(progress);
  
  // Use RAF for smooth visual updates
  const updateProgress = useCallback(
    rafSchedule((newProgress) => {
      setDisplayProgress(newProgress);
    }),
    []
  );

  React.useEffect(() => {
    updateProgress(progress);
  }, [progress, updateProgress]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel(fileId);
    }
  }, [fileId, onCancel]);

  return (
    <div className="file-upload-progress">
      <div className="file-info">
        <span className="file-name">{fileName}</span>
        <span className="file-progress-text">{Math.round(displayProgress)}%</span>
      </div>
      
      <div className="progress-bar-container">
        <div 
          className="progress-bar"
          style={{ 
            width: `${displayProgress}%`,
            transition: 'width 0.3s ease-out'
          }}
          role="progressbar"
          aria-valuenow={displayProgress}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
      
      {displayProgress < 100 && (
        <button
          type="button"
          onClick={handleCancel}
          className="cancel-button"
          aria-label="Cancel upload"
        >
          Cancel
        </button>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if progress changed by more than 5%
  // or if file/cancel props changed
  const progressDiff = Math.abs(prevProps.progress - nextProps.progress);
  return (
    progressDiff < 5 &&
    prevProps.fileId === nextProps.fileId &&
    prevProps.fileName === nextProps.fileName &&
    prevProps.onCancel === nextProps.onCancel
  );
});

OptimizedFileUploadProgress.displayName = 'OptimizedFileUploadProgress';

export default OptimizedFileUploadProgress;
