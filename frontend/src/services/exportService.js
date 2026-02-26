/**
 * Export Service Client
 * 
 * Handles data export API calls and file downloads.
 * Supports multiple data types (users, jobs, applications, courses, activity log)
 * and formats (Excel, CSV, PDF).
 * 
 * Requirements: 3.1-3.9
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Export data with specified configuration
 * 
 * @param {string} dataType - Type of data to export (users, jobs, applications, courses, activity_log)
 * @param {Object} config - Export configuration
 * @param {string} config.format - Export format (excel, csv, pdf)
 * @param {Object} config.dateRange - Date range filter
 * @param {string} config.dateRange.start - Start date (ISO string)
 * @param {string} config.dateRange.end - End date (ISO string)
 * @param {Object} config.filters - Additional filters
 * @returns {Promise<Object>} Export result with downloadUrl and expiresAt
 */
export const exportData = async (dataType, config) => {
  try {
    // Get auth token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Validate data type
    const validDataTypes = ['users', 'jobs', 'applications', 'courses', 'activity_log'];
    if (!validDataTypes.includes(dataType)) {
      throw new Error(`Invalid data type: ${dataType}`);
    }

    // Validate format
    const validFormats = ['excel', 'csv', 'pdf'];
    if (!validFormats.includes(config.format)) {
      throw new Error(`Invalid format: ${config.format}`);
    }

    // Make API request
    const response = await fetch(`${API_URL}/api/admin/export/${dataType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(config)
    });

    // Handle errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Export failed with status ${response.status}`);
    }

    // Parse response
    const result = await response.json();

    // Validate response
    if (!result.downloadUrl) {
      throw new Error('Invalid export response: missing downloadUrl');
    }

    return result;
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

/**
 * Download file from URL
 * 
 * @param {string} url - File URL
 * @param {string} filename - Suggested filename
 * @returns {Promise<void>}
 */
export const downloadFile = async (url, filename) => {
  try {
    // Get auth token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Fetch file
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Handle errors
    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    // Get blob
    const blob = await response.blob();

    // Create download link
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'export';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

/**
 * Export and download data in one operation
 * 
 * @param {string} dataType - Type of data to export
 * @param {Object} config - Export configuration
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<void>}
 */
export const exportAndDownload = async (dataType, config, onProgress) => {
  try {
    // Notify progress: starting export
    if (onProgress) {
      onProgress({ stage: 'exporting', progress: 0 });
    }

    // Export data
    const result = await exportData(dataType, config);

    // Notify progress: export complete, starting download
    if (onProgress) {
      onProgress({ stage: 'downloading', progress: 50 });
    }

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const extension = config.format === 'excel' ? 'xlsx' : config.format;
    const filename = `${dataType}_export_${timestamp}.${extension}`;

    // Download file
    await downloadFile(result.downloadUrl, filename);

    // Notify progress: complete
    if (onProgress) {
      onProgress({ stage: 'complete', progress: 100 });
    }
  } catch (error) {
    // Notify progress: error
    if (onProgress) {
      onProgress({ stage: 'error', progress: 0, error: error.message });
    }
    throw error;
  }
};

/**
 * Show success notification
 * 
 * @param {string} message - Success message
 * @param {string} language - Language code (ar, en, fr)
 */
export const showSuccessNotification = (message, language = 'en') => {
  const translations = {
    ar: {
      success: 'نجح',
      exportComplete: 'تم التصدير بنجاح',
      downloadStarted: 'بدأ التنزيل'
    },
    en: {
      success: 'Success',
      exportComplete: 'Export completed successfully',
      downloadStarted: 'Download started'
    },
    fr: {
      success: 'Succès',
      exportComplete: 'Exportation réussie',
      downloadStarted: 'Téléchargement commencé'
    }
  };

  const t = translations[language] || translations.en;
  const displayMessage = message || t.exportComplete;

  // Create toast notification
  const toast = document.createElement('div');
  toast.className = 'export-toast export-toast-success';
  toast.innerHTML = `
    <div class="export-toast-icon">✓</div>
    <div class="export-toast-message">${displayMessage}</div>
  `;

  // Add to document
  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.add('export-toast-show');
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('export-toast-show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
};

/**
 * Show error notification
 * 
 * @param {string} message - Error message
 * @param {string} language - Language code (ar, en, fr)
 */
export const showErrorNotification = (message, language = 'en') => {
  const translations = {
    ar: {
      error: 'خطأ',
      exportFailed: 'فشل التصدير',
      tryAgain: 'يرجى المحاولة مرة أخرى'
    },
    en: {
      error: 'Error',
      exportFailed: 'Export failed',
      tryAgain: 'Please try again'
    },
    fr: {
      error: 'Erreur',
      exportFailed: 'L\'exportation a échoué',
      tryAgain: 'Veuillez réessayer'
    }
  };

  const t = translations[language] || translations.en;
  const displayMessage = message || t.exportFailed;

  // Create toast notification
  const toast = document.createElement('div');
  toast.className = 'export-toast export-toast-error';
  toast.innerHTML = `
    <div class="export-toast-icon">✕</div>
    <div class="export-toast-message">${displayMessage}</div>
  `;

  // Add to document
  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.add('export-toast-show');
  }, 10);

  // Remove after 5 seconds
  setTimeout(() => {
    toast.classList.remove('export-toast-show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 5000);
};

// Add toast styles to document
const addToastStyles = () => {
  if (document.getElementById('export-toast-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'export-toast-styles';
  style.textContent = `
    .export-toast {
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #fff;
      border-radius: 8px;
      padding: 16px 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 10000;
      transform: translateX(400px);
      opacity: 0;
      transition: all 0.3s ease;
    }

    .export-toast-show {
      transform: translateX(0);
      opacity: 1;
    }

    .export-toast-success {
      border-left: 4px solid #4caf50;
    }

    .export-toast-error {
      border-left: 4px solid #f44336;
    }

    .export-toast-icon {
      font-size: 20px;
      font-weight: bold;
    }

    .export-toast-success .export-toast-icon {
      color: #4caf50;
    }

    .export-toast-error .export-toast-icon {
      color: #f44336;
    }

    .export-toast-message {
      color: #304B60;
      font-size: 14px;
      font-weight: 500;
    }

    @media (max-width: 639px) {
      .export-toast {
        right: 10px;
        left: 10px;
        transform: translateY(-100px);
      }

      .export-toast-show {
        transform: translateY(0);
      }
    }
  `;

  document.head.appendChild(style);
};

// Initialize toast styles
if (typeof document !== 'undefined') {
  addToastStyles();
}

export default {
  exportData,
  downloadFile,
  exportAndDownload,
  showSuccessNotification,
  showErrorNotification
};
