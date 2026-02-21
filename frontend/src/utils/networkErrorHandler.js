/**
 * Network Error Handler Utility
 * 
 * Requirements:
 * - FR-ERR-9: When network errors occur, the system shall display specific network error messages with retry options
 * 
 * This utility provides:
 * - Specific error messages for different network error types
 * - Multi-language support (Arabic, English, French)
 * - Retry functionality with exponential backoff
 * - Integration with existing error boundaries
 * - Offline detection and handling
 */

import { logError } from './errorTracking';

/**
 * Network error types and their corresponding error codes
 */
export const NetworkErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',           // No internet connection
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',           // Request timeout
  SERVER_ERROR: 'SERVER_ERROR',             // 5xx server errors
  CLIENT_ERROR: 'CLIENT_ERROR',             // 4xx client errors
  CORS_ERROR: 'CORS_ERROR',                 // CORS policy error
  DNS_ERROR: 'DNS_ERROR',                   // DNS resolution failed
  SSL_ERROR: 'SSL_ERROR',                   // SSL/TLS certificate error
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',     // Rate limiting (429)
  UNAUTHORIZED_ERROR: 'UNAUTHORIZED_ERROR', // 401 Unauthorized
  FORBIDDEN_ERROR: 'FORBIDDEN_ERROR',       // 403 Forbidden
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',       // 404 Not Found
  OFFLINE_ERROR: 'OFFLINE_ERROR',           // Browser is offline
};

/**
 * Multi-language error messages
 */
const errorMessages = {
  ar: {
    [NetworkErrorTypes.NETWORK_ERROR]: {
      title: 'خطأ في الاتصال بالشبكة',
      message: 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.',
      action: 'إعادة المحاولة',
      suggestion: 'تأكد من اتصالك بالإنترنت'
    },
    [NetworkErrorTypes.TIMEOUT_ERROR]: {
      title: 'انتهت مهلة الطلب',
      message: 'استغرق الطلب وقتاً أطول من المتوقع. قد يكون الاتصال بطيئاً.',
      action: 'إعادة المحاولة',
      suggestion: 'تحقق من سرعة الإنترنت'
    },
    [NetworkErrorTypes.SERVER_ERROR]: {
      title: 'خطأ في الخادم',
      message: 'حدث خطأ في الخادم. نحن نعمل على حل المشكلة.',
      action: 'إعادة المحاولة',
      suggestion: 'حاول مرة أخرى خلال دقائق قليلة'
    },
    [NetworkErrorTypes.CLIENT_ERROR]: {
      title: 'خطأ في الطلب',
      message: 'هناك مشكلة في البيانات المرسلة. يرجى المحاولة مرة أخرى.',
      action: 'إعادة المحاولة',
      suggestion: 'تحقق من البيانات المدخلة'
    },
    [NetworkErrorTypes.CORS_ERROR]: {
      title: 'خطأ في سياسة الأمان',
      message: 'تم حظر الطلب بواسطة سياسة الأمان في المتصفح.',
      action: 'تحديث الصفحة',
      suggestion: 'حدث الصفحة أو اتصل بالدعم'
    },
    [NetworkErrorTypes.DNS_ERROR]: {
      title: 'خطأ في العنوان',
      message: 'تعذر العثور على الخادم. قد تكون هناك مشكلة في DNS.',
      action: 'إعادة المحاولة',
      suggestion: 'تحقق من إعدادات الشبكة'
    },
    [NetworkErrorTypes.SSL_ERROR]: {
      title: 'خطأ في الشهادة الأمنية',
      message: 'هناك مشكلة في شهادة الأمان للموقع.',
      action: 'تحديث الصفحة',
      suggestion: 'تأكد من صحة الرابط'
    },
    [NetworkErrorTypes.RATE_LIMIT_ERROR]: {
      title: 'تم تجاوز الحد المسموح',
      message: 'تم إرسال طلبات كثيرة جداً. يرجى الانتظار قليلاً.',
      action: 'المحاولة لاحقاً',
      suggestion: 'انتظر دقيقة واحدة قبل المحاولة'
    },
    [NetworkErrorTypes.UNAUTHORIZED_ERROR]: {
      title: 'غير مصرح',
      message: 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.',
      action: 'تسجيل الدخول',
      suggestion: 'سجل دخولك مرة أخرى'
    },
    [NetworkErrorTypes.FORBIDDEN_ERROR]: {
      title: 'غير مسموح',
      message: 'ليس لديك صلاحية للوصول إلى هذا المحتوى.',
      action: 'العودة',
      suggestion: 'تواصل مع الإدارة للحصول على الصلاحية'
    },
    [NetworkErrorTypes.NOT_FOUND_ERROR]: {
      title: 'غير موجود',
      message: 'المحتوى المطلوب غير موجود أو تم حذفه.',
      action: 'العودة للرئيسية',
      suggestion: 'تحقق من صحة الرابط'
    },
    [NetworkErrorTypes.OFFLINE_ERROR]: {
      title: 'غير متصل بالإنترنت',
      message: 'أنت غير متصل بالإنترنت حالياً. سيتم إعادة المحاولة عند الاتصال.',
      action: 'إعادة المحاولة',
      suggestion: 'تحقق من اتصالك بالإنترنت'
    }
  },
  en: {
    [NetworkErrorTypes.NETWORK_ERROR]: {
      title: 'Network Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      action: 'Retry',
      suggestion: 'Check your internet connection'
    },
    [NetworkErrorTypes.TIMEOUT_ERROR]: {
      title: 'Request Timeout',
      message: 'The request took longer than expected. Your connection might be slow.',
      action: 'Retry',
      suggestion: 'Check your internet speed'
    },
    [NetworkErrorTypes.SERVER_ERROR]: {
      title: 'Server Error',
      message: 'A server error occurred. We are working to resolve the issue.',
      action: 'Retry',
      suggestion: 'Try again in a few minutes'
    },
    [NetworkErrorTypes.CLIENT_ERROR]: {
      title: 'Request Error',
      message: 'There was a problem with the data sent. Please try again.',
      action: 'Retry',
      suggestion: 'Check the entered data'
    },
    [NetworkErrorTypes.CORS_ERROR]: {
      title: 'Security Policy Error',
      message: 'The request was blocked by browser security policy.',
      action: 'Refresh Page',
      suggestion: 'Refresh the page or contact support'
    },
    [NetworkErrorTypes.DNS_ERROR]: {
      title: 'Address Error',
      message: 'Could not find the server. There might be a DNS issue.',
      action: 'Retry',
      suggestion: 'Check your network settings'
    },
    [NetworkErrorTypes.SSL_ERROR]: {
      title: 'Security Certificate Error',
      message: 'There is an issue with the website\'s security certificate.',
      action: 'Refresh Page',
      suggestion: 'Make sure the URL is correct'
    },
    [NetworkErrorTypes.RATE_LIMIT_ERROR]: {
      title: 'Rate Limit Exceeded',
      message: 'Too many requests were sent. Please wait a moment.',
      action: 'Try Later',
      suggestion: 'Wait one minute before trying again'
    },
    [NetworkErrorTypes.UNAUTHORIZED_ERROR]: {
      title: 'Unauthorized',
      message: 'Your session has expired. Please log in again.',
      action: 'Log In',
      suggestion: 'Log in again'
    },
    [NetworkErrorTypes.FORBIDDEN_ERROR]: {
      title: 'Forbidden',
      message: 'You don\'t have permission to access this content.',
      action: 'Go Back',
      suggestion: 'Contact admin for permission'
    },
    [NetworkErrorTypes.NOT_FOUND_ERROR]: {
      title: 'Not Found',
      message: 'The requested content was not found or has been deleted.',
      action: 'Go Home',
      suggestion: 'Check if the URL is correct'
    },
    [NetworkErrorTypes.OFFLINE_ERROR]: {
      title: 'Offline',
      message: 'You are currently offline. Will retry when connection is restored.',
      action: 'Retry',
      suggestion: 'Check your internet connection'
    }
  },
  fr: {
    [NetworkErrorTypes.NETWORK_ERROR]: {
      title: 'Erreur de Connexion Réseau',
      message: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet et réessayez.',
      action: 'Réessayer',
      suggestion: 'Vérifiez votre connexion internet'
    },
    [NetworkErrorTypes.TIMEOUT_ERROR]: {
      title: 'Délai d\'Attente Dépassé',
      message: 'La requête a pris plus de temps que prévu. Votre connexion pourrait être lente.',
      action: 'Réessayer',
      suggestion: 'Vérifiez votre vitesse internet'
    },
    [NetworkErrorTypes.SERVER_ERROR]: {
      title: 'Erreur Serveur',
      message: 'Une erreur serveur s\'est produite. Nous travaillons à résoudre le problème.',
      action: 'Réessayer',
      suggestion: 'Réessayez dans quelques minutes'
    },
    [NetworkErrorTypes.CLIENT_ERROR]: {
      title: 'Erreur de Requête',
      message: 'Il y a eu un problème avec les données envoyées. Veuillez réessayer.',
      action: 'Réessayer',
      suggestion: 'Vérifiez les données saisies'
    },
    [NetworkErrorTypes.CORS_ERROR]: {
      title: 'Erreur de Politique de Sécurité',
      message: 'La requête a été bloquée par la politique de sécurité du navigateur.',
      action: 'Actualiser',
      suggestion: 'Actualisez la page ou contactez le support'
    },
    [NetworkErrorTypes.DNS_ERROR]: {
      title: 'Erreur d\'Adresse',
      message: 'Impossible de trouver le serveur. Il pourrait y avoir un problème DNS.',
      action: 'Réessayer',
      suggestion: 'Vérifiez vos paramètres réseau'
    },
    [NetworkErrorTypes.SSL_ERROR]: {
      title: 'Erreur de Certificat de Sécurité',
      message: 'Il y a un problème avec le certificat de sécurité du site.',
      action: 'Actualiser',
      suggestion: 'Assurez-vous que l\'URL est correcte'
    },
    [NetworkErrorTypes.RATE_LIMIT_ERROR]: {
      title: 'Limite de Taux Dépassée',
      message: 'Trop de requêtes ont été envoyées. Veuillez attendre un moment.',
      action: 'Réessayer Plus Tard',
      suggestion: 'Attendez une minute avant de réessayer'
    },
    [NetworkErrorTypes.UNAUTHORIZED_ERROR]: {
      title: 'Non Autorisé',
      message: 'Votre session a expiré. Veuillez vous reconnecter.',
      action: 'Se Connecter',
      suggestion: 'Connectez-vous à nouveau'
    },
    [NetworkErrorTypes.FORBIDDEN_ERROR]: {
      title: 'Interdit',
      message: 'Vous n\'avez pas la permission d\'accéder à ce contenu.',
      action: 'Retour',
      suggestion: 'Contactez l\'admin pour obtenir la permission'
    },
    [NetworkErrorTypes.NOT_FOUND_ERROR]: {
      title: 'Non Trouvé',
      message: 'Le contenu demandé n\'a pas été trouvé ou a été supprimé.',
      action: 'Accueil',
      suggestion: 'Vérifiez si l\'URL est correcte'
    },
    [NetworkErrorTypes.OFFLINE_ERROR]: {
      title: 'Hors Ligne',
      message: 'Vous êtes actuellement hors ligne. Nouvelle tentative lors de la reconnexion.',
      action: 'Réessayer',
      suggestion: 'Vérifiez votre connexion internet'
    }
  }
};

/**
 * Detect network error type from error object
 * 
 * @param {Error|Object} error - Error object from axios or fetch
 * @returns {string} Network error type
 */
export const detectNetworkErrorType = (error) => {
  // Check if browser is offline
  if (!navigator.onLine) {
    return NetworkErrorTypes.OFFLINE_ERROR;
  }

  // Axios error structure
  if (error.response) {
    const status = error.response.status;
    
    if (status === 401) return NetworkErrorTypes.UNAUTHORIZED_ERROR;
    if (status === 403) return NetworkErrorTypes.FORBIDDEN_ERROR;
    if (status === 404) return NetworkErrorTypes.NOT_FOUND_ERROR;
    if (status === 429) return NetworkErrorTypes.RATE_LIMIT_ERROR;
    if (status >= 400 && status < 500) return NetworkErrorTypes.CLIENT_ERROR;
    if (status >= 500) return NetworkErrorTypes.SERVER_ERROR;
  }

  // Network-level errors (no response received)
  if (error.request || error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    return NetworkErrorTypes.NETWORK_ERROR;
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return NetworkErrorTypes.TIMEOUT_ERROR;
  }

  // CORS errors
  if (error.message?.includes('CORS') || error.message?.includes('Access-Control')) {
    return NetworkErrorTypes.CORS_ERROR;
  }

  // DNS errors
  if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
    return NetworkErrorTypes.DNS_ERROR;
  }

  // SSL/TLS errors
  if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
    return NetworkErrorTypes.SSL_ERROR;
  }

  // Default to network error
  return NetworkErrorTypes.NETWORK_ERROR;
};

/**
 * Get error message for specific error type and language
 * 
 * @param {string} errorType - Network error type
 * @param {string} language - Language code ('ar', 'en', 'fr')
 * @returns {Object} Error message object
 */
export const getNetworkErrorMessage = (errorType, language = 'ar') => {
  const messages = errorMessages[language] || errorMessages.ar;
  return messages[errorType] || messages[NetworkErrorTypes.NETWORK_ERROR];
};

/**
 * Create a standardized network error object
 * 
 * @param {Error|Object} originalError - Original error from axios/fetch
 * @param {string} language - Language code
 * @param {Object} context - Additional context
 * @returns {Object} Standardized network error
 */
export const createNetworkError = (originalError, language = 'ar', context = {}) => {
  const errorType = detectNetworkErrorType(originalError);
  const errorMessage = getNetworkErrorMessage(errorType, language);
  
  return {
    type: errorType,
    originalError,
    title: errorMessage.title,
    message: errorMessage.message,
    action: errorMessage.action,
    suggestion: errorMessage.suggestion,
    isNetworkError: true,
    isRetryable: isRetryableError(errorType),
    retryDelay: getRetryDelay(errorType),
    context: {
      url: originalError.config?.url || context.url,
      method: originalError.config?.method || context.method,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      ...context
    }
  };
};

/**
 * Check if error type is retryable
 * 
 * @param {string} errorType - Network error type
 * @returns {boolean} Whether the error is retryable
 */
export const isRetryableError = (errorType) => {
  const retryableErrors = [
    NetworkErrorTypes.NETWORK_ERROR,
    NetworkErrorTypes.TIMEOUT_ERROR,
    NetworkErrorTypes.SERVER_ERROR,
    NetworkErrorTypes.DNS_ERROR,
    NetworkErrorTypes.OFFLINE_ERROR,
    NetworkErrorTypes.RATE_LIMIT_ERROR
  ];
  
  return retryableErrors.includes(errorType);
};

/**
 * Get retry delay for error type (in milliseconds)
 * 
 * @param {string} errorType - Network error type
 * @returns {number} Retry delay in milliseconds
 */
export const getRetryDelay = (errorType) => {
  const delays = {
    [NetworkErrorTypes.NETWORK_ERROR]: 2000,      // 2 seconds
    [NetworkErrorTypes.TIMEOUT_ERROR]: 3000,      // 3 seconds
    [NetworkErrorTypes.SERVER_ERROR]: 5000,       // 5 seconds
    [NetworkErrorTypes.DNS_ERROR]: 3000,          // 3 seconds
    [NetworkErrorTypes.OFFLINE_ERROR]: 1000,      // 1 second (will retry when online)
    [NetworkErrorTypes.RATE_LIMIT_ERROR]: 60000,  // 1 minute
  };
  
  return delays[errorType] || 2000;
};

/**
 * Retry function with exponential backoff
 * 
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.baseDelay - Base delay in milliseconds (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in milliseconds (default: 30000)
 * @param {Function} options.onRetry - Callback called before each retry
 * @returns {Promise} Promise that resolves with the result or rejects with the final error
 */
export const retryWithBackoff = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    onRetry = () => {}
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Don't retry non-retryable errors
      const errorType = detectNetworkErrorType(error);
      if (!isRetryableError(errorType)) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      
      // Call retry callback
      onRetry(attempt + 1, delay, error);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Handle network error with logging and user notification
 * 
 * @param {Error|Object} error - Network error
 * @param {Object} options - Handling options
 * @param {string} options.language - Language code
 * @param {string} options.component - Component name where error occurred
 * @param {string} options.action - Action being performed
 * @param {Function} options.onRetry - Retry callback function
 * @param {Object} options.context - Additional context
 * @returns {Object} Processed network error
 */
export const handleNetworkError = (error, options = {}) => {
  const {
    language = 'ar',
    component = 'Unknown',
    action = 'Unknown',
    onRetry,
    context = {}
  } = options;

  // Create standardized network error
  const networkError = createNetworkError(error, language, context);
  
  // Log error for tracking
  logError(error, {
    component,
    action,
    level: 'error',
    extra: {
      networkErrorType: networkError.type,
      isRetryable: networkError.isRetryable,
      retryDelay: networkError.retryDelay,
      context: networkError.context
    }
  });

  // Add retry function if provided
  if (onRetry && networkError.isRetryable) {
    networkError.retry = () => {
      return retryWithBackoff(onRetry, {
        maxRetries: 3,
        baseDelay: networkError.retryDelay,
        onRetry: (attempt, delay) => {
          console.log(`[NetworkError] Retry attempt ${attempt} in ${delay}ms`);
        }
      });
    };
  }

  return networkError;
};

/**
 * Create a network error handler for axios interceptors
 * 
 * @param {Object} options - Handler options
 * @param {string} options.language - Language code
 * @param {Function} options.onError - Error callback
 * @returns {Function} Axios error interceptor function
 */
export const createAxiosErrorHandler = (options = {}) => {
  const { language = 'ar', onError } = options;
  
  return (error) => {
    const networkError = handleNetworkError(error, {
      language,
      component: 'AxiosInterceptor',
      action: 'api-request',
      context: {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status
      }
    });
    
    // Call error callback if provided
    if (onError) {
      onError(networkError);
    }
    
    // Attach network error info to original error
    error.networkError = networkError;
    
    return Promise.reject(error);
  };
};

/**
 * Monitor online/offline status and handle accordingly
 * 
 * @param {Function} onOnline - Callback when going online
 * @param {Function} onOffline - Callback when going offline
 * @returns {Function} Cleanup function to remove event listeners
 */
export const monitorNetworkStatus = (onOnline, onOffline) => {
  const handleOnline = () => {
    console.log('[NetworkError] Connection restored');
    if (onOnline) onOnline();
  };
  
  const handleOffline = () => {
    console.log('[NetworkError] Connection lost');
    if (onOffline) onOffline();
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

export default {
  NetworkErrorTypes,
  detectNetworkErrorType,
  getNetworkErrorMessage,
  createNetworkError,
  isRetryableError,
  getRetryDelay,
  retryWithBackoff,
  handleNetworkError,
  createAxiosErrorHandler,
  monitorNetworkStatus
};